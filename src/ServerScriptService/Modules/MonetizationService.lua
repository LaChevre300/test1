local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local MonetizationConfig = require(configFolder:WaitForChild("MonetizationConfig"))

local MonetizationService = {}
MonetizationService.__index = MonetizationService

local REMOTES_FOLDER_NAME = "Remotes"
local REQUEST_REMOTE_NAME = "TycoonMonetizationRequest"

local function ensureRemotes()
	local remotesFolder = sharedFolder:FindFirstChild(REMOTES_FOLDER_NAME)
	if not remotesFolder then
		remotesFolder = Instance.new("Folder")
		remotesFolder.Name = REMOTES_FOLDER_NAME
		remotesFolder.Parent = sharedFolder
	end

	local requestRemote = remotesFolder:FindFirstChild(REQUEST_REMOTE_NAME)
	if not requestRemote then
		requestRemote = Instance.new("RemoteEvent")
		requestRemote.Name = REQUEST_REMOTE_NAME
		requestRemote.Parent = remotesFolder
	end

	return requestRemote
end

function MonetizationService.new(tycoonService)
	local self = setmetatable({}, MonetizationService)
	self.TycoonService = tycoonService
	self.Config = MonetizationConfig
	self.ProductById = MonetizationConfig.BuildLookupById(MonetizationConfig.DeveloperProducts)
	self.GamePassById = MonetizationConfig.BuildLookupById(MonetizationConfig.GamePasses)
	self.Connections = {}
	self.RequestRemote = ensureRemotes()

	if not MonetizationConfig.Enabled then
		return self
	end

	self.Connections[#self.Connections + 1] = self.RequestRemote.OnServerEvent:Connect(function(player, action, itemKey)
		self:_onClientRequest(player, action, itemKey)
	end)

	self.Connections[#self.Connections + 1] = MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, gamePassId, wasPurchased)
		if not wasPurchased then
			return
		end
		local entry = self.GamePassById[gamePassId]
		if entry then
			self:_applyGamePassEffect(player, entry.Data)
		end
	end)

	MarketplaceService.ProcessReceipt = function(receiptInfo)
		return self:_processReceipt(receiptInfo)
	end

	return self
end

function MonetizationService:_notify(player, message)
	self.TycoonService:Notify(player, message)
end

function MonetizationService:_applyGamePassEffect(player, passData)
	if passData.PerkType == "income_multiplier" then
		self.TycoonService:SetExternalIncomeMultiplier(player, passData.Multiplier or 1)
		self:_notify(player, ("Perk actif: %s"):format(passData.DisplayName))
		return
	end

	if passData.PerkType == "auto_collect" then
		self.TycoonService:SetAutoCollect(player, true)
		self:_notify(player, ("Perk actif: %s"):format(passData.DisplayName))
		return
	end
end

function MonetizationService:_safeOwnsPass(player, passId)
	local ok, owns = pcall(function()
		return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
	end)
	if not ok then
		return false
	end
	return owns == true
end

function MonetizationService:OnPlayerAdded(player)
	if not self.Config.Enabled then
		return
	end

	task.spawn(function()
		for _, passData in pairs(self.Config.GamePasses) do
			if passData.Id and passData.Id > 0 and self:_safeOwnsPass(player, passData.Id) then
				self:_applyGamePassEffect(player, passData)
			end
		end
	end)
end

function MonetizationService:_onClientRequest(player, action, itemKey)
	if not self.Config.Enabled then
		return
	end

	if action == "prompt_product" then
		local product = self.Config.DeveloperProducts[itemKey]
		if not product then
			return
		end
		if product.Id <= 0 then
			self:_notify(player, "Produit non configure (ID manquant).")
			return
		end
		MarketplaceService:PromptProductPurchase(player, product.Id)
		return
	end

	if action == "prompt_gamepass" then
		local gamePass = self.Config.GamePasses[itemKey]
		if not gamePass then
			return
		end
		if gamePass.Id <= 0 then
			self:_notify(player, "Gamepass non configure (ID manquant).")
			return
		end
		MarketplaceService:PromptGamePassPurchase(player, gamePass.Id)
		return
	end
end

function MonetizationService:_grantProduct(player, productData)
	if productData.RewardCash and productData.RewardCash > 0 then
		self.TycoonService:AddCash(player, productData.RewardCash, productData.DisplayName)
	end

	if productData.RewardRebirth then
		self.TycoonService:ForceRebirth(player)
		self:_notify(player, "Instant Rebirth applique.")
	end
end

function MonetizationService:_processReceipt(receiptInfo)
	if not self.Config.Enabled then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local productEntry = self.ProductById[receiptInfo.ProductId]
	if not productEntry then
		warn(("[Monetization] Product ID inconnu: %s"):format(tostring(receiptInfo.ProductId)))
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	self:_grantProduct(player, productEntry.Data)
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

function MonetizationService:Destroy()
	for _, connection in ipairs(self.Connections) do
		connection:Disconnect()
	end
	table.clear(self.Connections)
end

return MonetizationService
