local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local TycoonConfig = require(configFolder:WaitForChild("TycoonConfig"))

local TycoonFactory = require(script.Parent:WaitForChild("TycoonFactory"))

local TycoonService = {}
TycoonService.__index = TycoonService

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

function TycoonService.new()
	local self = setmetatable({}, TycoonService)
	self.WorldFolder, self.Plots = TycoonFactory.CreateWorld()
	self.PlayerStates = {}
	self.PlotByOwnerUserId = {}
	self.IncomeLoopRunning = false
	self.ToastNonce = 0

	self:_wirePlotPrompts()
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

function TycoonService:_setToast(player, message)
	self.ToastNonce += 1
	player:SetAttribute("TycoonToast", ("%d|%s"):format(self.ToastNonce, message))
end

function TycoonService:Notify(player, message)
	if self.PlayerStates[player] then
		self:_setToast(player, message)
	end
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
	local total = baseIncome * multiplier * state.ExternalIncomeMultiplier * overclockMultiplier

	state.IncomePerSecond = math.max(1, math.floor(total))
	state.Multiplier = multiplier
	state.BaseIncome = baseIncome
	state.UnlockCount = unlockCount
	state.CostDiscount = math.clamp(researchCostDiscount, 0, 0.65)
	state.OverclockDurationBonus = overclockDurationBonus
end

function TycoonService:_refreshRebirthPrompt(state)
	local plot = state.Plot
	local hasPrestigeTerminal = state.OwnedUnlocks.PrestigeTerminal == true
	local rebirthCost = TycoonConfig.GetRebirthCost(state.Data.Rebirths or 0)
	local shardReward = TycoonConfig.GetRebirthShardReward(state.Data.Rebirths or 0)
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
		TycoonFactory.SetOverclockState(
			plot,
			("OVERCLOCK ON (%ds)"):format(activeRemaining),
			false,
			Color3.fromRGB(81, 255, 152)
		)
		return
	end

	local cooldownRemaining = math.max(0, math.ceil((state.OverclockCooldownUntil or 0) - now))
	if cooldownRemaining > 0 then
		TycoonFactory.SetOverclockState(
			plot,
			("Cooldown %ds"):format(cooldownRemaining),
			false,
			Color3.fromRGB(136, 175, 255)
		)
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
			TycoonFactory.SetResearchState(
				state.Plot,
				research.Id,
				"locked",
				research.DisplayName,
				currentLevel,
				research.MaxLevel,
				nextCost
			)
		elseif currentLevel >= research.MaxLevel then
			TycoonFactory.SetResearchState(
				state.Plot,
				research.Id,
				"maxed",
				research.DisplayName,
				currentLevel,
				research.MaxLevel,
				nextCost
			)
		else
			TycoonFactory.SetResearchState(
				state.Plot,
				research.Id,
				"available",
				research.DisplayName,
				currentLevel,
				research.MaxLevel,
				nextCost
			)
		end
	end
end

function TycoonService:_updatePlayerStats(state)
	local player = state.Player
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
			state.Data.Cash += milestone.RewardCash or 0
			state.Data.Shards += milestone.RewardShards or 0
			rewardCount += 1
			rewardCash += milestone.RewardCash or 0
			rewardShards += milestone.RewardShards or 0
		end
	end

	if rewardCount > 0 then
		state.Data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)
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

	local state = {
		Player = player,
		Plot = plot,
		Data = data,
		OwnedUnlocks = ownedSet,
		ResearchLevels = copyResearchLevels(data.ResearchLevels),
		ClaimedMilestones = claimedMilestones,
		ClaimedMilestoneCount = claimedMilestoneCount,
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
	}

	data.ResearchLevels = copyResearchLevels(state.ResearchLevels)
	data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)

	self.PlayerStates[player] = state
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

	self:_recalculateIncome(state)
	self:_refreshButtons(state)
	self:_refreshResearchButtons(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("%s passe niveau %d"):format(research.DisplayName, currentLevel + 1))
	return true
end

function TycoonService:_performRebirth(state, forced)
	local rewardShards = TycoonConfig.GetRebirthShardReward(state.Data.Rebirths or 0)

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
	state.OverclockActiveUntil = now + duration
	state.OverclockCooldownUntil = now + TycoonConfig.OverclockCooldown

	self:_recalculateIncome(state)
	self:_refreshOverclockStatus(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("Overclock active pour %ds"):format(math.floor(duration)))
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

function TycoonService:ExportPlayerData(player)
	local state = self.PlayerStates[player]
	if not state then
		return nil
	end

	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)
	state.Data.ResearchLevels = copyResearchLevels(state.ResearchLevels)
	state.Data.ClaimedMilestones = milestoneListFromSet(state.ClaimedMilestones)

	return {
		Cash = toShortInteger(state.Data.Cash),
		Uncollected = toShortInteger(state.Data.Uncollected),
		Rebirths = toShortInteger(state.Data.Rebirths),
		Shards = toShortInteger(state.Data.Shards),
		TotalEarnings = toShortInteger(state.Data.TotalEarnings),
		OwnedUnlocks = state.Data.OwnedUnlocks,
		ResearchLevels = state.Data.ResearchLevels,
		ClaimedMilestones = state.Data.ClaimedMilestones,
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
			for player, state in pairs(self.PlayerStates) do
				if player.Parent == Players then
					self:_recalculateIncome(state)
					if state.AutoCollect then
						state.Data.Cash += state.IncomePerSecond
						state.Data.TotalEarnings += state.IncomePerSecond
						local rewardCount, rewardCash, rewardShards = self:_checkMilestones(state)
						if rewardCount > 0 then
							self:_setToast(player, ("Milestones auto: +$%d +%d shards"):format(rewardCash, rewardShards))
						end
					else
						state.Data.Uncollected += state.IncomePerSecond
					end
					self:_refreshOverclockStatus(state)
					self:_refreshResearchButtons(state)
					self:_updatePlayerStats(state)
				end
			end
		end
	end)
end

function TycoonService:Stop()
	self.IncomeLoopRunning = false
end

return TycoonService
