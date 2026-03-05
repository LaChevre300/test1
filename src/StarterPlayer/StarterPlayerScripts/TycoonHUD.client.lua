local Players = game:GetService("Players")
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

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TycoonHUD"
screenGui.ResetOnSpawn = false
screenGui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Name = "Main"
frame.Size = UDim2.fromOffset(360, 180)
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
	"Prochain rebirth",
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

local function refresh()
	stats["Cash"].Text = ("Cash: $%s"):format(shortNumber(player:GetAttribute("TycoonCash")))
	stats["Non collecte"].Text = ("Non collecte: $%s"):format(shortNumber(player:GetAttribute("TycoonUncollected")))
	stats["Revenu / sec"].Text = ("Revenu / sec: $%s"):format(shortNumber(player:GetAttribute("TycoonIncome")))
	stats["Rebirths"].Text = ("Rebirths: %s"):format(shortNumber(player:GetAttribute("TycoonRebirths")))
	stats["Prochain rebirth"].Text = ("Prochain rebirth: $%s"):format(shortNumber(player:GetAttribute("TycoonNextRebirthCost")))
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
player:GetAttributeChangedSignal("TycoonNextRebirthCost"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonToast"):Connect(onToastChanged)

refresh()
onToastChanged()
