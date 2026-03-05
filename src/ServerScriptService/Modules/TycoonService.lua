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

function TycoonService.new()
	local self = setmetatable({}, TycoonService)
	self.WorldFolder, self.Plots = TycoonFactory.CreateWorld()
	self.PlayerStates = {}
	self.PlotByOwnerUserId = {}
	self.IncomeLoopRunning = false

	self:_wirePlotPrompts()
	self:_startIncomeLoop()

	return self
end

function TycoonService:_wirePlotPrompts()
	for _, plot in ipairs(self.Plots) do
		plot.ClaimPrompt.Triggered:Connect(function(player)
			local state = self.PlayerStates[player]
			if state then
				return
			end

			if plot.OwnerUserId then
				return
			end
		end)

		plot.CollectorPrompt.Triggered:Connect(function(player)
			self:Collect(player)
		end)

		plot.RebirthPrompt.Triggered:Connect(function(player)
			self:TryRebirth(player)
		end)

		for unlockId, button in pairs(plot.ButtonsById) do
			button.Prompt.Triggered:Connect(function(player)
				self:TryPurchase(player, unlockId)
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
end

function TycoonService:_setToast(player, message)
	player:SetAttribute("TycoonToast", ("%d|%s"):format(os.time(), message))
end

function TycoonService:Notify(player, message)
	if self.PlayerStates[player] then
		self:_setToast(player, message)
	end
end

function TycoonService:_recalculateIncome(state)
	local baseIncome = 0
	local multiplier = 1

	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if state.OwnedUnlocks[unlock.Id] then
			baseIncome += unlock.Income or 0
			multiplier += unlock.MultiplierBonus or 0
		end
	end

	multiplier += (state.Data.Rebirths or 0) * TycoonConfig.RebirthIncomeBonus
	state.IncomePerSecond = math.max(1, math.floor(baseIncome * multiplier * state.ExternalIncomeMultiplier))
	state.Multiplier = multiplier
end

function TycoonService:_refreshRebirthPrompt(state)
	local plot = state.Plot
	local hasPrestigeTerminal = state.OwnedUnlocks.PrestigeTerminal == true
	local rebirthCost = TycoonConfig.GetRebirthCost(state.Data.Rebirths or 0)
	plot.RebirthPrompt.Enabled = hasPrestigeTerminal
	plot.RebirthPrompt.ActionText = ("Renaitre ($%d)"):format(rebirthCost)
	plot.RebirthPrompt.ObjectText = "Reinitialise ton tycoon + bonus permanent"
end

function TycoonService:_refreshButtons(state)
	for _, unlock in ipairs(TycoonConfig.Unlocks) do
		if not unlock.Starter then
			if state.OwnedUnlocks[unlock.Id] then
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "hidden", unlock.DisplayName, unlock.Cost)
			elseif hasAllRequirements(state.OwnedUnlocks, unlock.Requires) then
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "available", unlock.DisplayName, unlock.Cost)
			else
				TycoonFactory.SetButtonState(state.Plot, unlock.Id, "locked", unlock.DisplayName, unlock.Cost)
			end
		end
	end
	self:_refreshRebirthPrompt(state)
end

function TycoonService:_updatePlayerStats(state)
	local player = state.Player
	player:SetAttribute("TycoonCash", toShortInteger(state.Data.Cash))
	player:SetAttribute("TycoonUncollected", toShortInteger(state.Data.Uncollected))
	player:SetAttribute("TycoonIncome", toShortInteger(state.IncomePerSecond))
	player:SetAttribute("TycoonRebirths", toShortInteger(state.Data.Rebirths))
	player:SetAttribute("TycoonNextRebirthCost", TycoonConfig.GetRebirthCost(state.Data.Rebirths or 0))
	player:SetAttribute("TycoonAutoCollect", state.AutoCollect == true)

	local leaderstats = player:FindFirstChild("leaderstats")
	if leaderstats then
		local cash = leaderstats:FindFirstChild("Cash")
		local rebirths = leaderstats:FindFirstChild("Rebirths")
		if cash then
			cash.Value = toShortInteger(state.Data.Cash)
		end
		if rebirths then
			rebirths.Value = toShortInteger(state.Data.Rebirths)
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

	local state = {
		Player = player,
		Plot = plot,
		Data = data,
		OwnedUnlocks = ownedSet,
		IncomePerSecond = 1,
		Multiplier = 1,
		ExternalIncomeMultiplier = 1,
		AutoCollect = false,
	}

	self.PlayerStates[player] = state
	self:_createLeaderstats(player, data)
	self:_recalculateIncome(state)
	self:_loadBuiltUnlocks(state)
	self:_refreshButtons(state)
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

function TycoonService:TryPurchase(player, unlockId)
	local state = self.PlayerStates[player]
	if not state then
		return false
	end
	if state.Plot.OwnerUserId ~= player.UserId then
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
	if state.Data.Cash < unlock.Cost then
		self:_setToast(player, "Pas assez de cash.")
		return false
	end

	state.Data.Cash -= unlock.Cost
	state.OwnedUnlocks[unlockId] = true
	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)

	TycoonFactory.BuildUnlock(state.Plot, unlock)
	self:_recalculateIncome(state)
	self:_refreshButtons(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, ("Achat reussi: %s"):format(unlock.DisplayName))
	return true
end

function TycoonService:Collect(player)
	local state = self.PlayerStates[player]
	if not state then
		return false
	end
	if state.Plot.OwnerUserId ~= player.UserId then
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

	self:_updatePlayerStats(state)
	self:_setToast(player, ("+ $%d collectes"):format(uncollected))
	return true
end

function TycoonService:TryRebirth(player)
	local state = self.PlayerStates[player]
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

	state.Data.Cash = TycoonConfig.StartingCash
	state.Data.Uncollected = 0
	state.Data.Rebirths += 1
	state.OwnedUnlocks = {}
	for _, starterUnlock in ipairs(TycoonConfig.StarterUnlocks) do
		state.OwnedUnlocks[starterUnlock] = true
	end
	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)

	self:_recalculateIncome(state)
	self:_loadBuiltUnlocks(state)
	self:_refreshButtons(state)
	self:_updatePlayerStats(state)

	self:_setToast(player, ("Rebirth reussi ! Bonus revenu permanent x%.2f"):format(state.Multiplier))
	return true
end

function TycoonService:ForceRebirth(player)
	local state = self.PlayerStates[player]
	if not state then
		return false
	end

	state.Data.Cash = TycoonConfig.StartingCash
	state.Data.Uncollected = 0
	state.Data.Rebirths += 1
	state.OwnedUnlocks = {}
	for _, starterUnlock in ipairs(TycoonConfig.StarterUnlocks) do
		state.OwnedUnlocks[starterUnlock] = true
	end
	state.Data.OwnedUnlocks = ownedListFromSet(state.OwnedUnlocks)

	self:_recalculateIncome(state)
	self:_loadBuiltUnlocks(state)
	self:_refreshButtons(state)
	self:_updatePlayerStats(state)
	self:_setToast(player, "Rebirth force applique.")
	return true
end

function TycoonService:AddCash(player, amount, source)
	local state = self.PlayerStates[player]
	if not state then
		return false
	end

	local cleanAmount = toShortInteger(amount)
	if cleanAmount <= 0 then
		return false
	end

	state.Data.Cash += cleanAmount
	state.Data.TotalEarnings += cleanAmount
	self:_updatePlayerStats(state)
	if source then
		self:_setToast(player, ("+ $%d (%s)"):format(cleanAmount, source))
	end
	return true
end

function TycoonService:SetExternalIncomeMultiplier(player, multiplier)
	local state = self.PlayerStates[player]
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
	local state = self.PlayerStates[player]
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
	return {
		Cash = toShortInteger(state.Data.Cash),
		Uncollected = toShortInteger(state.Data.Uncollected),
		Rebirths = toShortInteger(state.Data.Rebirths),
		TotalEarnings = toShortInteger(state.Data.TotalEarnings),
		OwnedUnlocks = state.Data.OwnedUnlocks,
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
					if state.AutoCollect then
						state.Data.Cash += state.IncomePerSecond
						state.Data.TotalEarnings += state.IncomePerSecond
					else
						state.Data.Uncollected += state.IncomePerSecond
					end
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
