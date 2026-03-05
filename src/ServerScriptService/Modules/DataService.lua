local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local TycoonConfig = require(configFolder:WaitForChild("TycoonConfig"))

local DataService = {}
DataService.__index = DataService

local function copyArray(array)
	local out = {}
	for _, value in ipairs(array) do
		out[#out + 1] = value
	end
	return out
end

local function makeDefaultData()
	return {
		Cash = TycoonConfig.StartingCash,
		Uncollected = 0,
		Rebirths = 0,
		Shards = 0,
		TotalEarnings = 0,
		OwnedUnlocks = copyArray(TycoonConfig.StarterUnlocks),
		ResearchLevels = {},
		ClaimedMilestones = {},
		LastLoginDay = -1,
		LoginStreak = 0,
		DailyQuest = nil,
		Weekly = {
			WeekIndex = -1,
			Score = 0,
		},
	}
end

local function mergeData(raw)
	local data = makeDefaultData()
	if type(raw) ~= "table" then
		return data
	end

	if type(raw.Cash) == "number" then
		data.Cash = math.max(0, math.floor(raw.Cash))
	end
	if type(raw.Uncollected) == "number" then
		data.Uncollected = math.max(0, math.floor(raw.Uncollected))
	end
	if type(raw.Rebirths) == "number" then
		data.Rebirths = math.max(0, math.floor(raw.Rebirths))
	end
	if type(raw.Shards) == "number" then
		data.Shards = math.max(0, math.floor(raw.Shards))
	end
	if type(raw.TotalEarnings) == "number" then
		data.TotalEarnings = math.max(0, math.floor(raw.TotalEarnings))
	end
	if type(raw.LastLoginDay) == "number" then
		data.LastLoginDay = math.floor(raw.LastLoginDay)
	end
	if type(raw.LoginStreak) == "number" then
		data.LoginStreak = math.max(0, math.floor(raw.LoginStreak))
	end

	if type(raw.OwnedUnlocks) == "table" then
		local exists = {}
		local filtered = {}
		for _, unlockId in ipairs(raw.OwnedUnlocks) do
			if type(unlockId) == "string" and TycoonConfig.GetUnlockById(unlockId) and not exists[unlockId] then
				exists[unlockId] = true
				filtered[#filtered + 1] = unlockId
			end
		end
		if #filtered > 0 then
			data.OwnedUnlocks = filtered
		end
	end

	for _, starterId in ipairs(TycoonConfig.StarterUnlocks) do
		local found = false
		for _, unlockId in ipairs(data.OwnedUnlocks) do
			if unlockId == starterId then
				found = true
				break
			end
		end
		if not found then
			data.OwnedUnlocks[#data.OwnedUnlocks + 1] = starterId
		end
	end

	if type(raw.ResearchLevels) == "table" then
		for _, research in ipairs(TycoonConfig.ResearchUpgrades or {}) do
			local rawLevel = raw.ResearchLevels[research.Id]
			if type(rawLevel) == "number" then
				data.ResearchLevels[research.Id] = math.clamp(math.floor(rawLevel), 0, research.MaxLevel)
			end
		end
	end

	local milestoneById = {}
	for _, milestone in ipairs(TycoonConfig.Milestones or {}) do
		milestoneById[milestone.Id] = true
	end
	if type(raw.ClaimedMilestones) == "table" then
		local seenMilestones = {}
		for _, milestoneId in ipairs(raw.ClaimedMilestones) do
			if type(milestoneId) == "string" and milestoneById[milestoneId] and not seenMilestones[milestoneId] then
				seenMilestones[milestoneId] = true
				table.insert(data.ClaimedMilestones, milestoneId)
			end
		end
	end

	if type(raw.DailyQuest) == "table" then
		local questId = raw.DailyQuest.QuestId
		local questTemplate = type(questId) == "string" and TycoonConfig.GetDailyQuestById(questId) or nil
		if questTemplate then
			local target = math.max(1, math.floor(tonumber(raw.DailyQuest.Target) or questTemplate.TargetMin))
			local progress = math.clamp(math.floor(tonumber(raw.DailyQuest.Progress) or 0), 0, target)
			data.DailyQuest = {
				DayIndex = math.floor(tonumber(raw.DailyQuest.DayIndex) or -1),
				QuestId = questId,
				Target = target,
				Progress = progress,
				Claimed = raw.DailyQuest.Claimed == true,
				RewardCash = math.max(0, math.floor(tonumber(raw.DailyQuest.RewardCash) or questTemplate.RewardCash or 0)),
				RewardShards = math.max(0, math.floor(tonumber(raw.DailyQuest.RewardShards) or questTemplate.RewardShards or 0)),
			}
		end
	end

	if type(raw.Weekly) == "table" then
		data.Weekly = {
			WeekIndex = math.floor(tonumber(raw.Weekly.WeekIndex) or -1),
			Score = math.max(0, math.floor(tonumber(raw.Weekly.Score) or 0)),
		}
	end

	return data
end

function DataService.new()
	local self = setmetatable({}, DataService)
	self.Cache = {}
	self.DataStore = nil

	local ok, dataStoreOrError = pcall(function()
		return DataStoreService:GetDataStore(TycoonConfig.DataStoreName)
	end)

	if ok then
		self.DataStore = dataStoreOrError
	else
		warn("[DataService] DataStore indisponible:", dataStoreOrError)
	end

	return self
end

function DataService:Load(player)
	local userId = player.UserId
	local key = tostring(userId)
	local loaded = nil

	if self.DataStore then
		local ok, value = pcall(function()
			return self.DataStore:GetAsync(key)
		end)
		if ok then
			loaded = value
		else
			warn(("[DataService] Echec load %s: %s"):format(player.Name, tostring(value)))
		end
	end

	local data = mergeData(loaded)
	self.Cache[userId] = data
	return data
end

function DataService:Save(player, data)
	local userId = player.UserId
	self.Cache[userId] = data

	if not self.DataStore then
		return true
	end

	local key = tostring(userId)
	local toSave = mergeData(data)
	local ok, errorMessage = pcall(function()
		self.DataStore:SetAsync(key, toSave)
	end)

	if not ok then
		warn(("[DataService] Echec save %s: %s"):format(player.Name, tostring(errorMessage)))
	end
	return ok
end

function DataService:SaveAll(exportFn)
	for _, player in ipairs(game:GetService("Players"):GetPlayers()) do
		local data = exportFn(player)
		if data then
			self:Save(player, data)
		end
	end
end

function DataService:IsStudio()
	return RunService:IsStudio()
end

return DataService
