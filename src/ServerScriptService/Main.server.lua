local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedFolder = ReplicatedStorage:FindFirstChild("Shared")
if not sharedFolder then
	sharedFolder = Instance.new("Folder")
	sharedFolder.Name = "Shared"
	sharedFolder.Parent = ReplicatedStorage
end

local modulesFolder = script:WaitForChild("Modules")
local DataService = require(modulesFolder:WaitForChild("DataService"))
local TycoonService = require(modulesFolder:WaitForChild("TycoonService"))
local TycoonConfig = require(sharedFolder:WaitForChild("Config"):WaitForChild("TycoonConfig"))

local dataService = DataService.new()
local tycoonService = TycoonService.new()

local function savePlayer(player)
	local export = tycoonService:ExportPlayerData(player)
	if export then
		dataService:Save(player, export)
	end
end

Players.PlayerAdded:Connect(function(player)
	local data = dataService:Load(player)
	local ok = tycoonService:BindPlayer(player, data)
	if not ok then
		player:Kick("Le serveur est plein, aucun plot libre.")
	end
end)

Players.PlayerRemoving:Connect(function(player)
	savePlayer(player)
	tycoonService:UnbindPlayer(player)
end)

task.spawn(function()
	while true do
		task.wait(TycoonConfig.AutoSaveInterval)
		dataService:SaveAll(function(player)
			return tycoonService:ExportPlayerData(player)
		end)
	end
end)

game:BindToClose(function()
	tycoonService:Stop()
	for _, player in ipairs(Players:GetPlayers()) do
		savePlayer(player)
	end
end)
