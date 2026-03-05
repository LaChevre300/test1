local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")

local player = Players.LocalPlayer

local function shortNumber(value)
	local number = math.max(0, math.floor(tonumber(value) or 0))
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

local function toast(message)
	pcall(function()
		StarterGui:SetCore("SendNotification", {
			Title = "Tycoon",
			Text = message,
			Duration = 3,
		})
	end)
end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TycoonHUD"
screenGui.ResetOnSpawn = false
screenGui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Name = "Main"
frame.Size = UDim2.fromOffset(360, 410)
frame.Position = UDim2.fromOffset(20, 20)
frame.BackgroundColor3 = Color3.fromRGB(17, 18, 24)
frame.BorderSizePixel = 0
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 10)
corner.Parent = frame

local stroke = Instance.new("UIStroke")
stroke.Color = Color3.fromRGB(89, 247, 226)
stroke.Thickness = 2
stroke.Parent = frame

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, -14, 0, 32)
title.Position = UDim2.fromOffset(7, 6)
title.BackgroundTransparency = 1
title.Font = Enum.Font.GothamBold
title.TextSize = 21
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.Text = "Neon Noodle Tycoon"
title.Parent = frame

local subtitle = Instance.new("TextLabel")
subtitle.Size = UDim2.new(1, -14, 0, 20)
subtitle.Position = UDim2.fromOffset(7, 36)
subtitle.BackgroundTransparency = 1
subtitle.Font = Enum.Font.Gotham
subtitle.TextSize = 14
subtitle.TextXAlignment = Enum.TextXAlignment.Left
subtitle.TextColor3 = Color3.fromRGB(170, 176, 205)
subtitle.Text = "Collecte au pad jaune - Rebirth au pad rouge"
subtitle.Parent = frame

local stats = {}
local labels = {
	"Cash",
	"Non collecte",
	"Revenu / sec",
	"Rebirths",
	"Shards",
	"Prochain rebirth",
	"Progression",
	"Milestones",
	"Discount",
	"Auto collect",
}
for i, labelName in ipairs(labels) do
	local text = Instance.new("TextLabel")
	text.Name = ("Row%d"):format(i)
	text.Size = UDim2.new(1, -14, 0, 22)
	text.Position = UDim2.fromOffset(7, 62 + (i - 1) * 22)
	text.BackgroundTransparency = 1
	text.Font = Enum.Font.GothamSemibold
	text.TextSize = 16
	text.TextXAlignment = Enum.TextXAlignment.Left
	text.TextColor3 = Color3.fromRGB(230, 234, 255)
	text.Text = ("%s: ..."):format(labelName)
	text.Parent = frame
	stats[labelName] = text
end

local monetizationRemote = nil
task.spawn(function()
	local shared = ReplicatedStorage:WaitForChild("Shared", 10)
	if not shared then
		return
	end
	local remotes = shared:WaitForChild("Remotes", 10)
	if not remotes then
		return
	end
	local remote = remotes:WaitForChild("TycoonMonetizationRequest", 10)
	if remote and remote:IsA("RemoteEvent") then
		monetizationRemote = remote
	end
end)

local function requestPurchase(action, itemKey)
	if not monetizationRemote then
		toast("Boutique indisponible.")
		return
	end
	monetizationRemote:FireServer(action, itemKey)
end

local shopTitle = Instance.new("TextLabel")
shopTitle.Size = UDim2.new(1, -14, 0, 22)
shopTitle.Position = UDim2.fromOffset(7, 286)
shopTitle.BackgroundTransparency = 1
shopTitle.Font = Enum.Font.GothamBold
shopTitle.TextSize = 15
shopTitle.TextXAlignment = Enum.TextXAlignment.Left
shopTitle.TextColor3 = Color3.fromRGB(255, 227, 107)
shopTitle.Text = "Boutique"
shopTitle.Parent = frame

local function createShopButton(text, x, y, onClick)
	local button = Instance.new("TextButton")
	button.Size = UDim2.fromOffset(112, 34)
	button.Position = UDim2.fromOffset(x, y)
	button.BackgroundColor3 = Color3.fromRGB(42, 47, 63)
	button.TextColor3 = Color3.fromRGB(255, 255, 255)
	button.Font = Enum.Font.GothamBold
	button.TextSize = 13
	button.Text = text
	button.AutoButtonColor = true
	button.Parent = frame

	local btnCorner = Instance.new("UICorner")
	btnCorner.CornerRadius = UDim.new(0, 8)
	btnCorner.Parent = button

	button.MouseButton1Click:Connect(onClick)
	return button
end

createShopButton("Cash +2.5K", 7, 312, function()
	requestPurchase("prompt_product", "CashSmall")
end)

createShopButton("Cash +10K", 124, 312, function()
	requestPurchase("prompt_product", "CashMedium")
end)

createShopButton("Cash +50K", 241, 312, function()
	requestPurchase("prompt_product", "CashLarge")
end)

createShopButton("VIP x2 revenu", 7, 352, function()
	requestPurchase("prompt_gamepass", "VipIncomeX2")
end)

createShopButton("Auto Collect", 124, 352, function()
	requestPurchase("prompt_gamepass", "AutoCollector")
end)

createShopButton("Instant Rebirth", 241, 352, function()
	requestPurchase("prompt_product", "InstantRebirth")
end)

local function refresh()
	stats["Cash"].Text = ("Cash: $%s"):format(shortNumber(player:GetAttribute("TycoonCash")))
	stats["Non collecte"].Text = ("Non collecte: $%s"):format(shortNumber(player:GetAttribute("TycoonUncollected")))
	stats["Revenu / sec"].Text = ("Revenu / sec: $%s"):format(shortNumber(player:GetAttribute("TycoonIncome")))
	stats["Rebirths"].Text = ("Rebirths: %s"):format(shortNumber(player:GetAttribute("TycoonRebirths")))
	stats["Shards"].Text = ("Shards: %s"):format(shortNumber(player:GetAttribute("TycoonShards")))
	stats["Prochain rebirth"].Text = ("Prochain rebirth: $%s"):format(shortNumber(player:GetAttribute("TycoonNextRebirthCost")))
	stats["Progression"].Text = ("Progression: %s/%s"):format(
		shortNumber(player:GetAttribute("TycoonUnlockCount")),
		shortNumber(player:GetAttribute("TycoonTotalUnlocks"))
	)
	stats["Milestones"].Text = ("Milestones: %s/%s"):format(
		shortNumber(player:GetAttribute("TycoonMilestonesDone")),
		shortNumber(player:GetAttribute("TycoonMilestonesTotal"))
	)
	stats["Discount"].Text = ("Discount achats: %s%%"):format(shortNumber(player:GetAttribute("TycoonCostDiscountPct")))
	stats["Auto collect"].Text = ("Auto collect: %s"):format((player:GetAttribute("TycoonAutoCollect") and "ON") or "OFF")
end

local lastToastToken = ""
local function onToastChanged()
	local raw = tostring(player:GetAttribute("TycoonToast") or "")
	local token, message = raw:match("^(%d+)|(.+)$")
	if token and message and token ~= lastToastToken then
		lastToastToken = token
		toast(message)
	end
end

player:GetAttributeChangedSignal("TycoonCash"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonUncollected"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonIncome"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonRebirths"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonShards"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonNextRebirthCost"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonUnlockCount"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonTotalUnlocks"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonMilestonesDone"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonMilestonesTotal"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonCostDiscountPct"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonAutoCollect"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonToast"):Connect(onToastChanged)

refresh()
onToastChanged()
