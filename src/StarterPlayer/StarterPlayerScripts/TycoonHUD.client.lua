local Lighting = game:GetService("Lighting")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")
local StarterGui = game:GetService("StarterGui")

local player = Players.LocalPlayer

local POST_EFFECT_NAMES = {
	"TycoonBloom",
	"TycoonColorCorrection",
	"TycoonSunRays",
	"TycoonDepth",
	"TycoonAtmosphere",
}

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

local function truncate(text, maxLen)
	local raw = tostring(text or "")
	if #raw <= maxLen then
		return raw
	end
	return raw:sub(1, maxLen - 3) .. "..."
end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TycoonHUD"
screenGui.ResetOnSpawn = false
screenGui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Name = "Main"
frame.Size = UDim2.fromOffset(420, 680)
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
title.Text = "Neon Noodle Tycoon V4"
title.Parent = frame

local subtitle = Instance.new("TextLabel")
subtitle.Size = UDim2.new(1, -14, 0, 20)
subtitle.Position = UDim2.fromOffset(7, 36)
subtitle.BackgroundTransparency = 1
subtitle.Font = Enum.Font.Gotham
subtitle.TextSize = 14
subtitle.TextXAlignment = Enum.TextXAlignment.Left
subtitle.TextColor3 = Color3.fromRGB(170, 176, 205)
subtitle.Text = "Objectifs dynamiques - Daily quests - Event - Weekly top"
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
	"Streak",
	"Event",
	"Quest",
	"Weekly score",
	"Top hebdo",
	"Objectif",
	"Qualite",
}

for index, labelName in ipairs(labels) do
	local text = Instance.new("TextLabel")
	text.Name = ("Row%d"):format(index)
	text.Size = UDim2.new(1, -14, 0, 22)
	text.Position = UDim2.fromOffset(7, 62 + (index - 1) * 22)
	text.BackgroundTransparency = 1
	text.Font = Enum.Font.GothamSemibold
	text.TextSize = 15
	text.TextXAlignment = Enum.TextXAlignment.Left
	text.TextColor3 = Color3.fromRGB(230, 234, 255)
	text.Text = ("%s: ..."):format(labelName)
	text.Parent = frame
	stats[labelName] = text
end

local panelTitle = Instance.new("TextLabel")
panelTitle.Size = UDim2.new(1, -14, 0, 22)
panelTitle.Position = UDim2.fromOffset(7, 438)
panelTitle.BackgroundTransparency = 1
panelTitle.Font = Enum.Font.GothamBold
panelTitle.TextSize = 15
panelTitle.TextXAlignment = Enum.TextXAlignment.Left
panelTitle.TextColor3 = Color3.fromRGB(255, 227, 107)
panelTitle.Text = "Actions / Boutique / Graphismes"
panelTitle.Parent = frame

local function createButton(text, x, y, width, onClick)
	local button = Instance.new("TextButton")
	button.Size = UDim2.fromOffset(width, 34)
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

local monetizationRemote = nil
local retentionRemote = nil

task.spawn(function()
	local shared = ReplicatedStorage:WaitForChild("Shared", 10)
	if not shared then
		return
	end
	local remotes = shared:WaitForChild("Remotes", 10)
	if not remotes then
		return
	end

	local moneyRemote = remotes:WaitForChild("TycoonMonetizationRequest", 10)
	if moneyRemote and moneyRemote:IsA("RemoteEvent") then
		monetizationRemote = moneyRemote
	end

	local retention = remotes:WaitForChild("TycoonRetentionRequest", 10)
	if retention and retention:IsA("RemoteEvent") then
		retentionRemote = retention
	end
end)

local function requestPurchase(action, itemKey)
	if not monetizationRemote then
		toast("Boutique indisponible.")
		return
	end
	monetizationRemote:FireServer(action, itemKey)
end

local function requestRetention(action, payload)
	if not retentionRemote then
		toast("Systeme retention indisponible.")
		return
	end
	retentionRemote:FireServer(action, payload)
end

local trackedEmitters = {}
local trackedSounds = {}

local function cacheSceneEffects()
	for _, descendant in ipairs(workspace:GetDescendants()) do
		if descendant:IsA("ParticleEmitter") then
			trackedEmitters[descendant] = {
				Enabled = descendant.Enabled,
				Rate = descendant.Rate,
			}
		end
	end

	for _, descendant in ipairs(SoundService:GetDescendants()) do
		if descendant:IsA("Sound") and descendant.Name ~= "MachineHum" then
			trackedSounds[descendant] = {
				Volume = descendant.Volume,
			}
		end
	end
end

cacheSceneEffects()

workspace.DescendantAdded:Connect(function(descendant)
	if descendant:IsA("ParticleEmitter") then
		trackedEmitters[descendant] = {
			Enabled = descendant.Enabled,
			Rate = descendant.Rate,
		}
	elseif descendant:IsA("Sound") and descendant.Name ~= "MachineHum" then
		trackedSounds[descendant] = {
			Volume = descendant.Volume,
		}
	end
end)

local function applyQualityMode(mode)
	local quality = mode or "High"

	local disableHeavyEffects = quality == "Low"
	local mediumMode = quality == "Medium"

	for _, effectName in ipairs(POST_EFFECT_NAMES) do
		local effect = Lighting:FindFirstChild(effectName)
		if effect and effect:IsA("PostEffect") then
			if disableHeavyEffects then
				effect.Enabled = false
			elseif mediumMode then
				effect.Enabled = effectName ~= "TycoonDepth"
			else
				effect.Enabled = true
			end
		elseif effect and effect.ClassName == "Atmosphere" then
			effect.Parent = Lighting
			if disableHeavyEffects then
				effect.Density = 0.2
				effect.Haze = 1.1
			elseif mediumMode then
				effect.Density = 0.3
				effect.Haze = 1.6
			else
				effect.Density = 0.39
				effect.Haze = 2.1
			end
		end
	end

	for emitter, defaults in pairs(trackedEmitters) do
		if emitter.Parent then
			if disableHeavyEffects then
				emitter.Enabled = false
			elseif mediumMode then
				emitter.Enabled = defaults.Enabled
				emitter.Rate = defaults.Rate * 0.45
			else
				emitter.Enabled = defaults.Enabled
				emitter.Rate = defaults.Rate
			end
		end
	end

	for sound, defaults in pairs(trackedSounds) do
		if sound.Parent then
			if disableHeavyEffects then
				sound.Volume = defaults.Volume * 0.45
			elseif mediumMode then
				sound.Volume = defaults.Volume * 0.7
			else
				sound.Volume = defaults.Volume
			end
		end
	end
end

createButton("Claim Quest", 7, 466, 128, function()
	requestRetention("claim_daily_quest")
end)

createButton("Refresh Weekly", 144, 466, 128, function()
	requestRetention("refresh_weekly")
end)

createButton("Cash +2.5K", 281, 466, 128, function()
	requestPurchase("prompt_product", "CashSmall")
end)

createButton("Cash +10K", 7, 506, 128, function()
	requestPurchase("prompt_product", "CashMedium")
end)

createButton("Cash +50K", 144, 506, 128, function()
	requestPurchase("prompt_product", "CashLarge")
end)

createButton("Instant RB", 281, 506, 128, function()
	requestPurchase("prompt_product", "InstantRebirth")
end)

createButton("VIP x2 revenu", 7, 546, 200, function()
	requestPurchase("prompt_gamepass", "VipIncomeX2")
end)

createButton("Auto Collect", 209, 546, 200, function()
	requestPurchase("prompt_gamepass", "AutoCollector")
end)

createButton("LOW", 7, 586, 132, function()
	requestRetention("set_quality_mode", "Low")
end)

createButton("MEDIUM", 144, 586, 132, function()
	requestRetention("set_quality_mode", "Medium")
end)

createButton("HIGH", 281, 586, 128, function()
	requestRetention("set_quality_mode", "High")
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
	stats["Streak"].Text = ("Streak: J%s"):format(shortNumber(player:GetAttribute("TycoonLoginStreak")))
	stats["Event"].Text = ("Event: %s"):format(truncate(player:GetAttribute("TycoonEventName"), 34))
	stats["Quest"].Text = ("Quest: %s"):format(truncate(player:GetAttribute("TycoonDailyQuestText"), 52))
	stats["Weekly score"].Text = ("Weekly score: %s"):format(shortNumber(player:GetAttribute("TycoonWeeklyScore")))
	stats["Top hebdo"].Text = ("Top hebdo: %s"):format(truncate(player:GetAttribute("TycoonWeeklyTop"), 70))
	stats["Objectif"].Text = ("Objectif: %s"):format(truncate(player:GetAttribute("TycoonObjectiveText"), 60))

	local qualityMode = tostring(player:GetAttribute("TycoonQualityMode") or "High")
	stats["Qualite"].Text = ("Qualite: %s"):format(qualityMode)
	applyQualityMode(qualityMode)
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
player:GetAttributeChangedSignal("TycoonLoginStreak"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonEventName"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonDailyQuestText"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonWeeklyScore"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonWeeklyTop"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonObjectiveText"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonQualityMode"):Connect(refresh)
player:GetAttributeChangedSignal("TycoonToast"):Connect(onToastChanged)

refresh()
onToastChanged()
