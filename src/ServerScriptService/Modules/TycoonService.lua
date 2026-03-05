local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local TycoonConfig = require(configFolder:WaitForChild("TycoonConfig"))

local TycoonFactory = require(script.Parent:WaitForChild("TycoonFactory"))

local TycoonService = {}
TycoonService.__index = TycoonService

local REMOTES_FOLDER_NAME = "Remotes"
local RETENTION_REMOTE_NAME = "TycoonRetentionRequest"
local WEEKLY_SCORE_MULTIPLIER = 1_000_000_000_000
local QUALITY_MODES = {
	Low = true,
	Medium = true,
	High = true,
}

local FIRST_NON_STARTER_UNLOCK_ID = nil
for _, unlock in ipairs(TycoonConfig.Unlocks) do
	if not unlock.Starter then
		FIRST_NON_STARTER_UNLOCK_ID = unlock.Id
		break
	end
end

local function hasAllRequirements(owned, requirements)
	for _, requirement in ipairs(requirements or {}) do
		if not owned[requirement] then
			return false
		end
	end
	return true
end

local function toShortInteger(numberValue)
	return math.max(0, math.floor(numberValue or 0))
end

local function getCurrentDayIndex()
	return math.floor(os.time() / 86400)
end

local function getCurrentWeekIndex()
	return math.floor(os.time() / 604800)
end

local function ownedListFromSet(set)
	local list = {}
	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if set[unlock.Id] then
			list[#list + 1] = unlock.Id
		end
	end
	return list
end

local function milestoneListFromSet(set)
	local list = {}
	for _, milestone in ipairs(TycoonConfig.Milestones or {}) do
		if set[milestone.Id] then
			list[#list + 1] = milestone.Id
		end
	end
	return list
end

local function copyResearchLevels(source)
	local out = {}
	for _, research in ipairs(TycoonConfig.ResearchUpgrades or {}) do
		local level = toShortInteger(source and source[research.Id] or 0)
		out[research.Id] = math.clamp(level, 0, research.MaxLevel)
	end
	return out
end

local function copyDailyQuest(dataQuest)
	if type(dataQuest) ~= "table" then
		return nil
	end
	if type(dataQuest.QuestId) ~= "string" then
		return nil
	end
	return {
		DayIndex = math.floor(tonumber(dataQuest.DayIndex) or -1),
		QuestId = dataQuest.QuestId,
		Target = math.max(1, math.floor(tonumber(dataQuest.Target) or 1)),
		Progress = math.max(0, math.floor(tonumber(dataQuest.Progress) or 0)),
		Claimed = dataQuest.Claimed == true,
		RewardCash = math.max(0, math.floor(tonumber(dataQuest.RewardCash) or 0)),
		RewardShards = math.max(0, math.floor(tonumber(dataQuest.RewardShards) or 0)),
	}
end

local function ensureRetentionRemote()
	local remotesFolder = sharedFolder:FindFirstChild(REMOTES_FOLDER_NAME)
	if not remotesFolder then
		remotesFolder = Instance.new("Folder")
		remotesFolder.Name = REMOTES_FOLDER_NAME
		remotesFolder.Parent = sharedFolder
	end

	local retentionRemote = remotesFolder:FindFirstChild(RETENTION_REMOTE_NAME)
	if not retentionRemote then
		retentionRemote = Instance.new("RemoteEvent")
		retentionRemote.Name = RETENTION_REMOTE_NAME
		retentionRemote.Parent = remotesFolder
	end
	return retentionRemote
end

function TycoonService.new()
	local self = setmetatable({}, TycoonService)
	self.WorldFolder, self.Plots = TycoonFactory.CreateWorld()
	self.PlayerStates = {}
	self.PlotByOwnerUserId = {}
	self.IncomeLoopRunning = false
	self.ToastNonce = 0
	self.RetentionRemote = ensureRetentionRemote()
	self.ActiveDayIndex = -1
	self.ActiveEvent = nil
	self.CachedWeeklyTopText = "Classement hebdo indisponible"
	self.CachedWeeklyWeekIndex = getCurrentWeekIndex()
	self.LastLeaderboardSyncAt = 0
	self.Connections = {}
	self.WeeklyScoreStore = nil

	local ok, orderedStore = pcall(function()
		return DataStoreService:GetOrderedDataStore(TycoonConfig.WeeklyLeaderboardDataStoreName)
	end)
	if ok then
		self.WeeklyScoreStore = orderedStore
	end

	self:_wirePlotPrompts()
	self:_wireRetentionRemote()
	self:_refreshGlobalEventIfNeeded(true)
	self:_startIncomeLoop()
	return self
end

function TycoonService:_wirePlotPrompts()
	for _, plot in ipairs(self.Plots) do
		plot.ClaimPrompt.Triggered:Connect(function(player)
			local state = self.PlayerStates[player]
			if state and state.Plot == plot then
				self:_setToast(player, "Ce plot t'appartient deja.")
			end
		end)

		plot.CollectorPrompt.Triggered:Connect(function(player)
			self:Collect(player)
		end)

		plot.RebirthPrompt.Triggered:Connect(function(player)
			self:TryRebirth(player)
		end)

		plot.OverclockPrompt.Triggered:Connect(function(player)
			self:TriggerOverclock(player)
		end)

		for unlockId, button in pairs(plot.ButtonsById) do
			button.Prompt.Triggered:Connect(function(player)
				self:TryPurchase(player, unlockId)
			end)
		end

		for researchId, research in pairs(plot.ResearchById) do
			research.Prompt.Triggered:Connect(function(player)
				self:TryResearchUpgrade(player, researchId)
			end)
		end
	end
end

function TycoonService:_wireRetentionRemote()
	self.Connections[#self.Connections + 1] = self.RetentionRemote.OnServerEvent:Connect(function(player, action, payload)
		if action == "claim_daily_quest" then
			self:ClaimDailyQuest(player)
		elseif action == "refresh_weekly" then
			self:_syncWeeklyLeaderboard(true)
		elseif action == "set_quality_mode" then
			self:SetQualityMode(player, payload)
		end
	end)
end

function TycoonService:_setToast(player, message)
	self.ToastNonce += 1
	player:SetAttribute("TycoonToast", ("%d|%s"):format(self.ToastNonce, message))
end

function TycoonService:Notify(player, message)
	if self.PlayerStates[player] then
		self:_setToast(player, message)
	end
end

function TycoonService:_findFreePlot()
	for _, plot in ipairs(self.Plots) do
		if not plot.OwnerUserId then
			return plot
		end
	end
	return nil
end

function TycoonService:_assignPlot(player)
	if self.PlotByOwnerUserId[player.UserId] then
		return self.PlotByOwnerUserId[player.UserId]
	end

	local plot = self:_findFreePlot()
	if not plot then
		return nil
	end

	plot.OwnerUserId = player.UserId
	plot.ClaimPrompt.Enabled = false
	plot.CollectorPrompt.Enabled = true
	TycoonFactory.SetOwnerVisual(plot, ("TYCOON: %s"):format(player.DisplayName), Color3.fromRGB(128, 255, 166))
	self.PlotByOwnerUserId[player.UserId] = plot
	return plot
end

function TycoonService:_freePlot(plot)
	if not plot then
		return
	end
	self.PlotByOwnerUserId[plot.OwnerUserId or 0] = nil
	TycoonFactory.SetPlotUnclaimed(plot)
end

function TycoonService:_createLeaderstats(player, data)
	local existing = player:FindFirstChild("leaderstats")
	if existing then
		existing:Destroy()
	end

	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player

	local cash = Instance.new("IntValue")
	cash.Name = "Cash"
	cash.Value = toShortInteger(data.Cash)
	cash.Parent = leaderstats

	local rebirths = Instance.new("IntValue")
	rebirths.Name = "Rebirths"
	rebirths.Value = toShortInteger(data.Rebirths)
	rebirths.Parent = leaderstats

	local shards = Instance.new("IntValue")
	shards.Name = "Shards"
	shards.Value = toShortInteger(data.Shards)
	shards.Parent = leaderstats
end

function TycoonService:_getActiveRotationEvent(dayIndex)
	local events = TycoonConfig.RotationEvents or {}
	if #events == 0 then
		return {
			Id = "NoEvent",
			DisplayName = "No Event",
			Description = "Aucun event actif",
			IncomeMultiplier = 1,
			ShardMultiplier = 1,
			CostDiscountBonus = 0,
			OverclockDurationBonus = 0,
			OverclockCooldownMultiplier = 1,
		}
	end
	local eventIndex = (dayIndex % #events) + 1
	return events[eventIndex]
end

function TycoonService:_applyEventToState(state, notifyIfChanged)
	local event = self.ActiveEvent or self:_getActiveRotationEvent(getCurrentDayIndex())
	local changed = state.EventId ~= event.Id

	state.EventId = event.Id
	state.EventName = event.DisplayName or "Event"
	state.EventDescription = event.Description or ""
	state.EventIncomeMultiplier = event.IncomeMultiplier or 1
	state.EventShardMultiplier = event.ShardMultiplier or 1
	state.EventCostDiscountBonus = event.CostDiscountBonus or 0
	state.EventOverclockDurationBonus = event.OverclockDurationBonus or 0
	state.EventOverclockCooldownMultiplier = event.OverclockCooldownMultiplier or 1

	if changed and notifyIfChanged then
		self:_setToast(state.Player, ("Nouvel event: %s"):format(state.EventName))
	end
end

function TycoonService:_refreshGlobalEventIfNeeded(force)
	local dayIndex = getCurrentDayIndex()
	if not force and dayIndex == self.ActiveDayIndex then
		return
	end

	self.ActiveDayIndex = dayIndex
	self.ActiveEvent = self:_getActiveRotationEvent(dayIndex)
	for _, state in pairs(self.PlayerStates) do
		self:_applyEventToState(state, true)
		self:_recalculateIncome(state)
		self:_refreshButtons(state)
		self:_refreshResearchButtons(state)
		self:_refreshOverclockStatus(state)
		self:_updatePlayerStats(state)
	end
end

function TycoonService:_ensureWeeklyBucket(state)
	local currentWeek = getCurrentWeekIndex()
	if type(state.Data.Weekly) ~= "table" then
		state.Data.Weekly = {
			WeekIndex = currentWeek,
			Score = 0,
		}
	end

	if state.Data.Weekly.WeekIndex ~= currentWeek then
		state.Data.Weekly.WeekIndex = currentWeek
		state.Data.Weekly.Score = 0
		state.WeeklyDirty = true
	end

	state.WeeklyScore = toShortInteger(state.Data.Weekly.Score)
	state.Data.Weekly.Score = state.WeeklyScore
end

function TycoonService:_encodeWeeklyValue(weekIndex, score)
	local safeScore = math.clamp(toShortInteger(score), 0, WEEKLY_SCORE_MULTIPLIER - 1)
	return weekIndex * WEEKLY_SCORE_MULTIPLIER + safeScore
end

function TycoonService:_decodeWeeklyValue(encoded)
	local value = tonumber(encoded) or 0
	local weekIndex = math.floor(value / WEEKLY_SCORE_MULTIPLIER)
	local score = value - weekIndex * WEEKLY_SCORE_MULTIPLIER
	return weekIndex, toShortInteger(score)
end

function TycoonService:_addWeeklyScore(state, amount)
	local cleanAmount = toShortInteger(amount)
	if cleanAmount <= 0 then
		return
	end
	self:_ensureWeeklyBucket(state)
	state.WeeklyScore += cleanAmount
	state.Data.Weekly.Score = state.WeeklyScore
	state.WeeklyDirty = true
end

function TycoonService:_getDisplayNameFromUserId(userId)
	local player = Players:GetPlayerByUserId(userId)
	if player then
		return player.DisplayName
	end
	local ok, name = pcall(function()
		return Players:GetNameFromUserIdAsync(userId)
	end)
	if ok and type(name) == "string" and name ~= "" then
		return name
	end
	return ("User%d"):format(userId)
end

function TycoonService:_syncWeeklyLeaderboard(force)
	local now = os.clock()
	if not force and now - self.LastLeaderboardSyncAt < TycoonConfig.WeeklyLeaderboardRefreshInterval then
		return
	end
	self.LastLeaderboardSyncAt = now

	local currentWeek = getCurrentWeekIndex()
	self.CachedWeeklyWeekIndex = currentWeek

	if self.WeeklyScoreStore then
		for _, state in pairs(self.PlayerStates) do
			self:_ensureWeeklyBucket(state)
			if state.WeeklyDirty or force then
				local encoded = self:_encodeWeeklyValue(currentWeek, state.WeeklyScore)
				pcall(function()
					self.WeeklyScoreStore:SetAsync(tostring(state.Player.UserId), encoded)
				end)
				state.WeeklyDirty = false
			end
		end

		local ok, pages = pcall(function()
			return self.WeeklyScoreStore:GetSortedAsync(false, 6)
		end)
		if ok and pages then
			local lines = {}
			local rank = 1
			for _, entry in ipairs(pages:GetCurrentPage()) do
				local userId = tonumber(entry.key)
				if userId then
					local weekIndex, score = self:_decodeWeeklyValue(entry.value)
					if weekIndex == currentWeek then
						local name = self:_getDisplayNameFromUserId(userId)
						lines[#lines + 1] = ("%d) %s - %s"):format(rank, name, self:_shortNumber(score))
						rank += 1
						if rank > 5 then
							break
						end
					end
				end
			end
			if #lines > 0 then
				self.CachedWeeklyTopText = table.concat(lines, " | ")
			else
				self.CachedWeeklyTopText = "Aucun score cette semaine"
			end
		end
	end

	for _, state in pairs(self.PlayerStates) do
		self:_updatePlayerStats(state)
	end
end

function TycoonService:_shortNumber(value)
	local number = toShortInteger(value)
	if number >= 1_000_000_000 then
		return ("%.2fB"):format(number / 1_000_000_000)
	end
	if number >= 1_000_000 then
		return ("%.2fM"):format(number / 1_000_000)
	end
	if number >= 1_000 then
		return ("%.1fK"):format(number / 1_000)
	end
	return tostring(number)
end

function TycoonService:_generateDailyQuestForPlayer(userId, dayIndex)
	local questPool = TycoonConfig.DailyQuestPool or {}
	if #questPool == 0 then
		return nil
	end

	local questIndex = ((dayIndex + userId) % #questPool) + 1
	local questTemplate = questPool[questIndex]
	local targetRange = math.max(0, (questTemplate.TargetMax or questTemplate.TargetMin or 1) - (questTemplate.TargetMin or 1))
	local targetDelta = targetRange > 0 and ((dayIndex * 37 + userId) % (targetRange + 1)) or 0
	local target = (questTemplate.TargetMin or 1) + targetDelta

	return {
		DayIndex = dayIndex,
		QuestId = questTemplate.Id,
		Target = math.max(1, target),
		Progress = 0,
		Claimed = false,
		RewardCash = toShortInteger(questTemplate.RewardCash),
		RewardShards = toShortInteger(questTemplate.RewardShards),
	}
end

function TycoonService:_ensureDailyQuest(state)
	local dayIndex = getCurrentDayIndex()
	local quest = copyDailyQuest(state.Data.DailyQuest)
	if quest and quest.DayIndex == dayIndex then
		quest.Progress = math.clamp(quest.Progress, 0, quest.Target)
		state.Data.DailyQuest = quest
		state.DailyQuest = quest
		return
	end

	local generated = self:_generateDailyQuestForPlayer(state.Player.UserId, dayIndex)
	state.Data.DailyQuest = generated
	state.DailyQuest = generated
	if generated then
		self:_setToast(state.Player, ("Nouvelle quete du jour: %s"):format(TycoonConfig.GetDailyQuestById(generated.QuestId).DisplayName))
	end
end

function TycoonService:_addDailyQuestProgress(state, progressType, amount)
	local quest = state.DailyQuest
	if not quest or quest.Claimed then
		return
	end

	local template = TycoonConfig.GetDailyQuestById(quest.QuestId)
	if not template or template.Type ~= progressType then
		return
	end

	local before = quest.Progress
	quest.Progress = math.clamp(quest.Progress + math.max(0, toShortInteger(amount)), 0, quest.Target)
	state.Data.DailyQuest = quest
	if before < quest.Target and quest.Progress >= quest.Target then
		self:_setToast(state.Player, "Quete du jour completee! Clique sur Claim Quest.")
	end
end

function TycoonService:_applyLoginReward(state)
	local currentDay = getCurrentDayIndex()
	local lastLoginDay = toShortInteger(state.Data.LastLoginDay)
	if lastLoginDay == currentDay then
		return
	end

	local streak = 1
	if lastLoginDay == currentDay - 1 then
		streak = toShortInteger(state.Data.LoginStreak) + 1
	end
	state.Data.LoginStreak = streak
	state.Data.LastLoginDay = currentDay

	local rewards = TycoonConfig.DailyLoginRewards or {}
	if #rewards == 0 then
		return
	end
	local reward = rewards[((streak - 1) % #rewards) + 1]
	local cashReward = toShortInteger(reward.Cash)
	local shardReward = math.max(0, math.floor((reward.Shards or 0) * (state.EventShardMultiplier or 1)))
	state.Data.Cash += cashReward
	state.Data.Shards += shardReward
	self:_setToast(state.Player, ("Bonus connexion J%d: +$%d +%d shards"):format(streak, cashReward, shardReward))
end

function TycoonService:_isOverclockUnlocked(state)
	return state.OwnedUnlocks[TycoonConfig.OverclockUnlockId] == true
end

function TycoonService:_isOverclockActive(state)
	if not self:_isOverclockUnlocked(state) then
		return false
	end
	return os.clock() < (state.OverclockActiveUntil or 0)
end

function TycoonService:_getDiscountedCost(state, baseCost)
	baseCost = toShortInteger(baseCost)
	if baseCost <= 0 then
		return 0
	end
	local discounted = math.floor(baseCost * (1 - state.CostDiscount))
	return math.max(1, discounted)
end

function TycoonService:_recalculateIncome(state)
	local baseIncome = 0
	local multiplier = 1
	local unlockCount = 0

	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if state.OwnedUnlocks[unlock.Id] then
			unlockCount += 1
			baseIncome += unlock.Income or 0
			multiplier += unlock.MultiplierBonus or 0
		end
	end

	local researchIncomeBonus = 0
	local researchCostDiscount = 0
	local overclockDurationBonus = 0
	for _, research in ipairs(TycoonConfig.ResearchUpgrades or {}) do
		local level = state.ResearchLevels[research.Id] or 0
		if research.EffectType == "income_multiplier" then
			researchIncomeBonus += level * (research.EffectPerLevel or 0)
		elseif research.EffectType == "cost_discount" then
			researchCostDiscount += level * (research.EffectPerLevel or 0)
		elseif research.EffectType == "overclock_duration" then
			overclockDurationBonus += level * (research.EffectPerLevel or 0)
		end
	end

	multiplier += (state.Data.Rebirths or 0) * TycoonConfig.RebirthIncomeBonus
	multiplier += researchIncomeBonus

	local overclockMultiplier = self:_isOverclockActive(state) and TycoonConfig.OverclockMultiplier or 1
	local total = baseIncome
		* multiplier
		* state.ExternalIncomeMultiplier
		* (state.EventIncomeMultiplier or 1)
		* overclockMultiplier

	state.IncomePerSecond = math.max(1, math.floor(total))
	state.Multiplier = multiplier
	state.BaseIncome = baseIncome
	state.UnlockCount = unlockCount
	state.CostDiscount = math.clamp(researchCostDiscount + (state.EventCostDiscountBonus or 0), 0, 0.75)
	state.OverclockDurationBonus = overclockDurationBonus + (state.EventOverclockDurationBonus or 0)
end

function TycoonService:_refreshRebirthPrompt(state)
	local plot = state.Plot
	local hasPrestigeTerminal = state.OwnedUnlocks.PrestigeTerminal == true
	local rebirthCost = TycoonConfig.GetRebirthCost(state.Data.Rebirths or 0)
	local shardReward = math.max(
		1,
		math.floor(TycoonConfig.GetRebirthShardReward(state.Data.Rebirths or 0) * (state.EventShardMultiplier or 1))
	)
	plot.RebirthPrompt.Enabled = hasPrestigeTerminal
	plot.RebirthPrompt.ActionText = ("Renaitre ($%d)"):format(rebirthCost)
	plot.RebirthPrompt.ObjectText = ("Reset tycoon + %d shards"):format(shardReward)
end

function TycoonService:_refreshOverclockStatus(state)
	local now = os.clock()
	local plot = state.Plot

	if not self:_isOverclockUnlocked(state) then
		TycoonFactory.SetOverclockState(plot, "Overclock verrouille", false, Color3.fromRGB(136, 175, 255))
		return
	end

	local activeRemaining = math.max(0, math.ceil((state.OverclockActiveUntil or 0) - now))
	if activeRemaining > 0 then
		TycoonFactory.SetOverclockState(plot, ("OVERCLOCK ON (%ds)"):format(activeRemaining), false, Color3.fromRGB(81, 255, 152))
		return
	end

	local cooldownRemaining = math.max(0, math.ceil((state.OverclockCooldownUntil or 0) - now))
	if cooldownRemaining > 0 then
		TycoonFactory.SetOverclockState(plot, ("Cooldown %ds"):format(cooldownRemaining), false, Color3.fromRGB(136, 175, 255))
		return
	end

	TycoonFactory.SetOverclockState(
		plot,
		("Overclock pret x%.1f"):format(TycoonConfig.OverclockMultiplier),
		true,
		Color3.fromRGB(118, 212, 255)
	)
end

function TycoonService:_refreshButtons(state)
	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if not unlock.Starter then
			local discountedCost = self:_getDiscountedCost(state, unlock.Cost)
			if state.OwnedUnlocks[unlock.Id] then
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "hidden", unlock.DisplayName, discountedCost)
			elseif hasAllRequirements(state.OwnedUnlocks, unlock.Requires) then
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "available", unlock.DisplayName, discountedCost)
			else
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "locked", unlock.DisplayName, discountedCost)
			end
		end
	end
	self:_refreshRebirthPrompt(state)
end

function TycoonService:_refreshResearchButtons(state)
	local researchUnlocked = state.OwnedUnlocks[TycoonConfig.ResearchUnlockId] == true
	for _, research in ipairs(TycoonConfig.ResearchUpgrades) do
		local currentLevel = state.ResearchLevels[research.Id] or 0
		local nextCost = TycoonConfig.GetResearchLevelCost(research.Id, currentLevel)

		if not researchUnlocked then
			TycoonFactory.SetResearchState(state.Plot, research.Id, "locked", research.DisplayName, currentLevel, research.MaxLevel, nextCost)
		elseif currentLevel >= research.MaxLevel then
			TycoonFactory.SetResearchState(state.Plot, research.Id, "maxed", research.DisplayName, currentLevel, research.MaxLevel, nextCost)
		else
			TycoonFactory.SetResearchState(state.Plot, research.Id, "available", research.DisplayName, currentLevel, research.MaxLevel, nextCost)
		end
	end
end

function TycoonService:_getDailyQuestLabel(state)
	local quest = state.DailyQuest
	if not quest then
		return "Aucune quete du jour"
	end
	local questTemplate = TycoonConfig.GetDailyQuestById(quest.QuestId)
	if not questTemplate then
		return "Aucune quete du jour"
	end
	local status = ("%s %d/%d"):format(questTemplate.DisplayName, toShortInteger(quest.Progress), toShortInteger(quest.Target))
	if quest.Claimed then
		return status .. " [CLAIMED]"
	end
	if quest.Progress >= quest.Target then
		return status .. " [READY]"
	end
	return status
end

function TycoonService:_computeObjectiveText(state)
	if FIRST_NON_STARTER_UNLOCK_ID and not state.OwnedUnlocks[FIRST_NON_STARTER_UNLOCK_ID] then
		return "Objectif: Achete ta premiere machine."
	end

	if (state.Data.Uncollected or 0) >= math.max(1500, (state.IncomePerSecond or 1) * 6) then
		return "Objectif: Collecte ton cash au pad jaune."
	end

	if not state.OwnedUnlocks[TycoonConfig.ResearchUnlockId] then
		return "Objectif: Debloque la recherche avancee."
	end

	local quest = state.DailyQuest
	if quest and (not quest.Claimed) and quest.Progress >= quest.Target then
		return "Objectif: Claim la quete du jour."
	end

	if not state.OwnedUnlocks[TycoonConfig.OverclockUnlockId] then
		return "Objectif: Continue pour debloquer Overclock."
	end

	if not state.OwnedUnlocks.PrestigeTerminal then
		return "Objectif: Atteins le Terminal de Prestige."
	end

	if (state.Data.Rebirths or 0) < 1 then
		return "Objectif: Lance ton premier rebirth."
	end

	return "Objectif: Monte ton score hebdo et optimise ton usine."
end

function TycoonService:_updatePlayerStats(state)
	local player = state.Player
	self:_ensureWeeklyBucket(state)

	player:SetAttribute("TycoonCash", toShortInteger(state.Data.Cash))
	player:SetAttribute("TycoonUncollected", toShortInteger(state.Data.Uncollected))
	player:SetAttribute("TycoonIncome", toShortInteger(state.IncomePerSecond))
	player:SetAttribute("TycoonRebirths", toShortInteger(state.Data.Rebirths))
	player:SetAttribute("TycoonShards", toShortInteger(state.Data.Shards))
	player:SetAttribute("TycoonNextRebirthCost", TycoonConfig.GetRebirthCost(state.Data.Rebirths or 0))
	player:SetAttribute("TycoonAutoCollect", state.AutoCollect == true)
	player:SetAttribute("TycoonUnlockCount", state.UnlockCount or 0)
	player:SetAttribute("TycoonTotalUnlocks", #TycoonConfig.Unlocks)
	player:SetAttribute("TycoonMilestonesDone", state.ClaimedMilestoneCount or 0)
	player:SetAttribute("TycoonMilestonesTotal", #TycoonConfig.Milestones)
	player:SetAttribute("TycoonCostDiscountPct", math.floor((state.CostDiscount or 0) * 100))
	player:SetAttribute(
		"TycoonOverclockReady",
		self:_isOverclockUnlocked(state)
			and (not self:_isOverclockActive(state))
			and os.clock() >= (state.OverclockCooldownUntil or 0)
	)
	player:SetAttribute("TycoonLoginStreak", toShortInteger(state.Data.LoginStreak))
	player:SetAttribute("TycoonEventName", state.EventName or "Event")
	player:SetAttribute("TycoonEventDescription", state.EventDescription or "")
	player:SetAttribute("TycoonDailyQuestText", self:_getDailyQuestLabel(state))
	player:SetAttribute("TycoonDailyQuestClaimed", state.DailyQuest and state.DailyQuest.Claimed == true)
	player:SetAttribute("TycoonDailyQuestReady", state.DailyQuest and state.DailyQuest.Progress >= state.DailyQuest.Target and not state.DailyQuest.Claimed)
	player:SetAttribute("TycoonWeeklyScore", toShortInteger(state.WeeklyScore))
	player:SetAttribute("TycoonWeeklyTop", self.CachedWeeklyTopText)
	player:SetAttribute("TycoonQualityMode", state.QualityMode or "High")
	player:SetAttribute("TycoonObjectiveText", self:_computeObjectiveText(state))

	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats then
		local cash = leaderstats:FindFirstChild("Cash")
		local rebirths = leaderstats:FindFirstChild("Rebirths")
		local shards = leaderstats:FindFirstChild("Shards")
		if cash then
			cash.Value = toShortInteger(state.Data.Cash)
		end
		if rebirths then
			rebirths.Value = toShortInteger(state.Data.Rebirths)
		end
		if shards then
			shards.Value = toShortInteger(state.Data.Shards)
		end
	end
end

function TycoonService:_loadBuiltUnlocks(state)
	TycoonFactory.ResetPlotBuild(state.Plot)
	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if state.OwnedUnlocks[unlock.Id] then
			TycoonFactory.BuildUnlock(state.Plot, unlock)
		end
	end
end

function TycoonService:_checkMilestones(state)
	local rewardCount = 0
	local rewardCash = 0
	local rewardShards = 0

	for _, milestone in ipairs(TycoonConfig.Milestones) do
		if not state.ClaimedMilestones[milestone.Id] and state.Data.TotalEarnings >= milestone.TargetTotalEarnings then
			state.ClaimedMilestones[milestone.Id] = true
			state.ClaimedMilestoneCount += 1
			local cashGain = milestone.RewardCash or 0
			local shardGain = math.max(0, math.floor((milestone.RewardShards or 0) * (state.EventShardMultiplier or 1)))
			state.Data.Cash += cashGain
			state.Data.Shards += shardGain
			rewardCount += 1
			rewardCash += cashGain
			rewardShards += shardGain
		end
	end

	if rewardCount > 0 then
		state.Data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)
		self:_addDailyQuestProgress(state, "claim_milestones", rewardCount)
	end
	return rewardCount, rewardCash, rewardShards
end

function TycoonService:BindPlayer(player, data)
	local plot = self:_assignPlot(player)
	if not plot then
		self:_setToast(player, "Aucun plot libre pour le moment.")
		return false
	end

	local ownedSet = {}
	for _, unlockId in ipairs(data.OwnedUnlocks or {}) do
		ownedSet[unlockId] = true
	end
	for _, starterUnlockId in ipairs(TycoonConfig.StarterUnlocks) do
		ownedSet[starterUnlockId] = true
	end

	local claimedMilestones = {}
	local claimedMilestoneCount = 0
	for _, milestoneId in ipairs(data.ClaimedMilestones or {}) do
		if type(milestoneId) == "string" and not claimedMilestones[milestoneId] then
			claimedMilestones[milestoneId] = true
			claimedMilestoneCount += 1
		end
	end

	if type(data.Settings) ~= "table" then
		data.Settings = {}
	end
	local qualityMode = type(data.Settings.QualityMode) == "string" and data.Settings.QualityMode or "High"
	if not QUALITY_MODES[qualityMode] then
		qualityMode = "High"
	end
	data.Settings.QualityMode = qualityMode

	local state = {
		Player = player,
		Plot = plot,
		Data = data,
		OwnedUnlocks = ownedSet,
		ResearchLevels = copyResearchLevels(data.ResearchLevels),
		ClaimedMilestones = claimedMilestones,
		ClaimedMilestoneCount = claimedMilestoneCount,
		DailyQuest = copyDailyQuest(data.DailyQuest),
		QualityMode = qualityMode,
		IncomePerSecond = 1,
		Multiplier = 1,
		BaseIncome = 0,
		UnlockCount = 0,
		CostDiscount = 0,
		OverclockDurationBonus = 0,
		ExternalIncomeMultiplier = 1,
		AutoCollect = false,
		OverclockActiveUntil = 0,
		OverclockCooldownUntil = 0,
		EventId = "NoEvent",
		EventName = "No Event",
		EventDescription = "",
		EventIncomeMultiplier = 1,
		EventShardMultiplier = 1,
		EventCostDiscountBonus = 0,
		EventOverclockDurationBonus = 0,
		EventOverclockCooldownMultiplier = 1,
		WeeklyScore = 0,
		WeeklyDirty = true,
	}

	data.ResearchLevels = copyResearchLevels(state.ResearchLevels)
	data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)

	self.PlayerStates[player] = state
	self:_applyEventToState(state, false)
	self:_applyLoginReward(state)
	self:_ensureDailyQuest(state)
	self:_ensureWeeklyBucket(state)
	self:_createLeaderstats(player, data)
	self:_recalculateIncome(state)
	self:_loadBuiltUnlocks(state)
	self:_refreshButtons(state)
	self:_refreshResearchButtons(state)
	self:_refreshOverclockStatus(state)

	local rewardCount, rewardCash, rewardShards = self:_checkMilestones(state)
	if rewardCount > 0 then
		self:_setToast(player, ("Milestones retroactifs: +$%d et +%d shards"):format(rewardCash, rewardShards))
	end

	self:_updatePlayerStats(state)
	self:_setToast(player, ("Tycoon attribue: %s"):format(plot.Model.Name))
	task.spawn(function()
		self:_syncWeeklyLeaderboard(true)
	end)
	return true
end

function TycoonService:UnbindPlayer(player)
	local state = self.PlayerStates[player]
	if not state then
		return
	end
	self:_freePlot(state.Plot)
	self.PlayerStates[player] = nil
end

function TycoonService:_getOwnedState(player)
	local state = self.PlayerStates[player]
	if not state then
		return nil
	end
	if state.Plot.OwnerUserId ~= player.UserId then
		return nil
	end
	return state
end

function TycoonService:TryPurchase(player, unlockId)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end

	local unlock = TycoonConfig.GetUnlockById(unlockId)
	if not unlock or unlock.Starter then
		return false
	end
	if state.OwnedUnlocks[unlockId] then
		return false
	end
	if not hasAllRequirements(state.OwnedUnlocks, unlock.Requires) then
		self:_setToast(player, "Prerequis manquants.")
		return false
	end

	local price = self:_getDiscountedCost(state, unlock.Cost)
	if state.Data.Cash < price then
		self:_setToast(player, "Pas assez de cash.")
		return false
	end

	state.Data.Cash -= price
	state.OwnedUnlocks[unlockId] = true
	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)
	TycoonFactory.BuildUnlock(state.Plot, unlock)

	self:_addDailyQuestProgress(state, "buy_upgrades", 1)
	self:_recalculateIncome(state)
	self:_refreshButtons(state)
	self:_refreshResearchButtons(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("Achat reussi: %s"):format(unlock.DisplayName))
	return true
end

function TycoonService:Collect(player)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end

	local uncollected = toShortInteger(state.Data.Uncollected)
	if uncollected <= 0 then
		self:_setToast(player, "Rien a collecter.")
		return false
	end

	state.Data.Cash += uncollected
	state.Data.Uncollected = 0
	state.Data.TotalEarnings += uncollected
	self:_addWeeklyScore(state, uncollected)
	self:_addDailyQuestProgress(state, "collect_cash", uncollected)

	local rewardCount, rewardCash, rewardShards = self:_checkMilestones(state)
	self:_refreshResearchButtons(state)
	self:_updatePlayerStats(state)

	if rewardCount > 0 then
		self:_setToast(player, ("+ $%d collectes | Milestones +$%d +%d shards"):format(uncollected, rewardCash, rewardShards))
	else
		self:_setToast(player, ("+ $%d collectes"):format(uncollected))
	end
	return true
end

function TycoonService:TryResearchUpgrade(player, researchId)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	if not state.OwnedUnlocks[TycoonConfig.ResearchUnlockId] then
		self:_setToast(player, "Debloque d'abord la recherche avancee.")
		return false
	end

	local research = TycoonConfig.GetResearchById(researchId)
	if not research then
		return false
	end

	local currentLevel = state.ResearchLevels[researchId] or 0
	if currentLevel >= research.MaxLevel then
		self:_setToast(player, "Recherche deja au niveau max.")
		return false
	end

	local cost = TycoonConfig.GetResearchLevelCost(researchId, currentLevel)
	if state.Data.Shards < cost then
		self:_setToast(player, ("Il faut %d shards."):format(cost))
		return false
	end

	state.Data.Shards -= cost
	state.ResearchLevels[researchId] = currentLevel + 1
	state.Data.ResearchLevels = copyResearchLevels(state.ResearchLevels)
	self:_addDailyQuestProgress(state, "spend_shards", cost)

	self:_recalculateIncome(state)
	self:_refreshButtons(state)
	self:_refreshResearchButtons(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("%s passe niveau %d"):format(research.DisplayName, currentLevel + 1))
	return true
end

function TycoonService:_performRebirth(state, forced)
	local rewardShards = math.max(
		1,
		math.floor(TycoonConfig.GetRebirthShardReward(state.Data.Rebirths or 0) * (state.EventShardMultiplier or 1))
	)

	state.Data.Cash = TycoonConfig.StartingCash
	state.Data.Uncollected = 0
	state.Data.Rebirths += 1
	state.Data.Shards += rewardShards
	state.OwnedUnlocks = {}
	for _, starterUnlock in ipairs(TycoonConfig.StarterUnlocks) do
		state.OwnedUnlocks[starterUnlock] = true
	end
	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)
	state.OverclockActiveUntil = 0
	state.OverclockCooldownUntil = 0
	self:_addDailyQuestProgress(state, "do_rebirth", 1)

	self:_recalculateIncome(state)
	self:_loadBuiltUnlocks(state)
	self:_refreshButtons(state)
	self:_refreshResearchButtons(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)

	if forced then
		self:_setToast(state.Player, ("Instant Rebirth applique (+%d shards)"):format(rewardShards))
	else
		self:_setToast(state.Player, ("Rebirth reussi ! +%d shards"):format(rewardShards))
	end
	return true
end

function TycoonService:TryRebirth(player)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	if not state.OwnedUnlocks.PrestigeTerminal then
		self:_setToast(player, "Debloque d'abord le Terminal de Prestige.")
		return false
	end

	local rebirthCost = TycoonConfig.GetRebirthCost(state.Data.Rebirths)
	if state.Data.Cash < rebirthCost then
		self:_setToast(player, ("Il te faut $%d pour renaitre."):format(rebirthCost))
		return false
	end

	return self:_performRebirth(state, false)
end

function TycoonService:ForceRebirth(player)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	return self:_performRebirth(state, true)
end

function TycoonService:TriggerOverclock(player)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	if not self:_isOverclockUnlocked(state) then
		self:_setToast(player, "Debloque d'abord le Hub Controle Fusion.")
		return false
	end

	local now = os.clock()
	if now < state.OverclockActiveUntil then
		self:_setToast(player, "Overclock deja actif.")
		return false
	end
	if now < state.OverclockCooldownUntil then
		local remain = math.ceil(state.OverclockCooldownUntil - now)
		self:_setToast(player, ("Overclock en cooldown: %ds"):format(remain))
		return false
	end

	local duration = TycoonConfig.OverclockDuration + (state.OverclockDurationBonus or 0)
	local cooldown = math.max(10, math.floor(TycoonConfig.OverclockCooldown * (state.EventOverclockCooldownMultiplier or 1)))
	state.OverclockActiveUntil = now + duration
	state.OverclockCooldownUntil = now + cooldown
	self:_addDailyQuestProgress(state, "trigger_overclock", 1)

	self:_recalculateIncome(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("Overclock active pour %ds"):format(math.floor(duration)))
	return true
end

function TycoonService:ClaimDailyQuest(player)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	self:_ensureDailyQuest(state)

	local quest = state.DailyQuest
	if not quest then
		self:_setToast(player, "Aucune quete du jour.")
		return false
	end
	if quest.Claimed then
		self:_setToast(player, "Quete du jour deja claim.")
		return false
	end
	if quest.Progress < quest.Target then
		self:_setToast(player, "Quete du jour non completee.")
		return false
	end

	local cashReward = toShortInteger(quest.RewardCash)
	local shardReward = math.max(0, math.floor((quest.RewardShards or 0) * (state.EventShardMultiplier or 1)))
	quest.Claimed = true
	state.Data.DailyQuest = quest
	state.Data.Cash += cashReward
	state.Data.Shards += shardReward

	self:_updatePlayerStats(state)
	self:_setToast(player, ("Quete claim: +$%d +%d shards"):format(cashReward, shardReward))
	return true
end

function TycoonService:AddCash(player, amount, source, includeInTotalEarnings)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end

	local cleanAmount = toShortInteger(amount)
	if cleanAmount <= 0 then
		return false
	end

	state.Data.Cash += cleanAmount
	if includeInTotalEarnings == true then
		state.Data.TotalEarnings += cleanAmount
		self:_addWeeklyScore(state, cleanAmount)
		self:_addDailyQuestProgress(state, "collect_cash", cleanAmount)
		self:_checkMilestones(state)
	end

	self:_refreshResearchButtons(state)
	self:_updatePlayerStats(state)
	if source then
		self:_setToast(player, ("+ $%d (%s)"):format(cleanAmount, source))
	end
	return true
end

function TycoonService:SetExternalIncomeMultiplier(player, multiplier)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end

	local cleanMultiplier = tonumber(multiplier) or 1
	cleanMultiplier = math.max(1, cleanMultiplier)
	state.ExternalIncomeMultiplier = math.max(state.ExternalIncomeMultiplier, cleanMultiplier)
	self:_recalculateIncome(state)
	self:_updatePlayerStats(state)
	return true
end

function TycoonService:SetAutoCollect(player, enabled)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end

	state.AutoCollect = enabled == true
	self:_updatePlayerStats(state)
	return true
end

function TycoonService:SetQualityMode(player, qualityMode)
	local state = self:_getOwnedState(player)
	if not state then
		return false
	end
	if type(qualityMode) ~= "string" or not QUALITY_MODES[qualityMode] then
		return false
	end

	state.QualityMode = qualityMode
	if type(state.Data.Settings) ~= "table" then
		state.Data.Settings = {}
	end
	state.Data.Settings.QualityMode = qualityMode
	self:_updatePlayerStats(state)
	self:_setToast(player, ("Qualite graphique: %s"):format(qualityMode))
	return true
end

function TycoonService:ExportPlayerData(player)
	local state = self.PlayerStates[player]
	if not state then
		return nil
	end

	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)
	state.Data.ResearchLevels = copyResearchLevels(state.ResearchLevels)
	state.Data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)
	state.Data.DailyQuest = copyDailyQuest(state.DailyQuest)
	state.Data.Settings = {
		QualityMode = state.QualityMode or "High",
	}
	state.Data.Weekly = {
		WeekIndex = getCurrentWeekIndex(),
		Score = toShortInteger(state.WeeklyScore),
	}

	return {
		Cash = toShortInteger(state.Data.Cash),
		Uncollected = toShortInteger(state.Data.Uncollected),
		Rebirths = toShortInteger(state.Data.Rebirths),
		Shards = toShortInteger(state.Data.Shards),
		TotalEarnings = toShortInteger(state.Data.TotalEarnings),
		OwnedUnlocks = state.Data.OwnedUnlocks,
		ResearchLevels = state.Data.ResearchLevels,
		ClaimedMilestones = state.Data.ClaimedMilestones,
		LastLoginDay = toShortInteger(state.Data.LastLoginDay),
		LoginStreak = toShortInteger(state.Data.LoginStreak),
		DailyQuest = state.Data.DailyQuest,
		Settings = state.Data.Settings,
		Weekly = state.Data.Weekly,
	}
end

function TycoonService:_startIncomeLoop()
	if self.IncomeLoopRunning then
		return
	end

	self.IncomeLoopRunning = true
	task.spawn(function()
		while self.IncomeLoopRunning do
			task.wait(TycoonConfig.IncomeTickSeconds)
			self:_refreshGlobalEventIfNeeded(false)

			for player, state in pairs(self.PlayerStates) do
				if player.Parent == Players then
					self:_ensureDailyQuest(state)
					self:_ensureWeeklyBucket(state)
					self:_recalculateIncome(state)
					if state.AutoCollect then
						state.Data.Cash += state.IncomePerSecond
						state.Data.TotalEarnings += state.IncomePerSecond
						self:_addWeeklyScore(state, state.IncomePerSecond)
						self:_addDailyQuestProgress(state, "collect_cash", state.IncomePerSecond)
						local rewardCount, rewardCash, rewardShards = self:_checkMilestones(state)
						if rewardCount > 0 then
							self:_setToast(player, ("Milestones auto: +$%d +%d shards"):format(rewardCash, rewardShards))
						end
					else
						state.Data.Uncollected += state.IncomePerSecond
					end
					self:_refreshOverclockStatus(state)
					self:_updatePlayerStats(state)
				end
			end

			self:_syncWeeklyLeaderboard(false)
		end
	end)
end

function TycoonService:Stop()
	self.IncomeLoopRunning = false
	self:_syncWeeklyLeaderboard(true)
	for _, connection in ipairs(self.Connections) do
		connection:Disconnect()
	end
	table.clear(self.Connections)
end

return TycoonService
