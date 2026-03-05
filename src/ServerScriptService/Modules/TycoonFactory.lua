local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")

local sharedFolder = ReplicatedStorage:WaitForChild("Shared")
local configFolder = sharedFolder:WaitForChild("Config")
local TycoonConfig = require(configFolder:WaitForChild("TycoonConfig"))

local TycoonFactory = {}

local function clamp01(value)
	return math.clamp(value, 0, 1)
end

local function lighten(color, amount)
	return Color3.new(
		clamp01(color.R + (1 - color.R) * amount),
		clamp01(color.G + (1 - color.G) * amount),
		clamp01(color.B + (1 - color.B) * amount)
	)
end

local function darken(color, amount)
	return Color3.new(
		clamp01(color.R * (1 - amount)),
		clamp01(color.G * (1 - amount)),
		clamp01(color.B * (1 - amount))
	)
end

local function hashFromText(text)
	local hash = 0
	for index = 1, #text do
		hash = (hash * 31 + string.byte(text, index)) % 100000
	end
	return hash
end

local function createPart(name, size, cframe, color, material, parent)
	local part = Instance.new("Part")
	part.Name = name
	part.Size = size
	part.CFrame = cframe
	part.Color = color
	part.Material = material
	part.Anchored = true
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

local function createCylinder(name, size, cframe, color, material, parent)
	local part = createPart(name, size, cframe, color, material, parent)
	part.Shape = Enum.PartType.Cylinder
	return part
end

local function createBall(name, size, cframe, color, material, parent)
	local part = createPart(name, size, cframe, color, material, parent)
	part.Shape = Enum.PartType.Ball
	return part
end

local function createBillboard(parent, text, textColor)
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "Billboard"
	billboard.Size = UDim2.fromOffset(220, 70)
	billboard.StudsOffset = Vector3.new(0, 4, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = parent

	local label = Instance.new("TextLabel")
	label.Name = "Label"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = textColor
	label.TextStrokeTransparency = 0.45
	label.Text = text
	label.Parent = billboard

	return label
end

local function createPrompt(parent, actionText, objectText)
	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = "Prompt"
	prompt.ActionText = actionText
	prompt.ObjectText = objectText
	prompt.HoldDuration = 0.15
	prompt.MaxActivationDistance = 12
	prompt.RequiresLineOfSight = false
	prompt.Parent = parent
	return prompt
end

local function addPointLight(part, color, brightness, range)
	local light = Instance.new("PointLight")
	light.Color = color
	light.Brightness = brightness
	light.Range = range
	light.Shadows = true
	light.Parent = part
	return light
end

local function addSparkParticles(parent, color)
	local emitter = Instance.new("ParticleEmitter")
	emitter.Rate = 8
	emitter.Lifetime = NumberRange.new(0.35, 0.9)
	emitter.Speed = NumberRange.new(1.2, 2.8)
	emitter.SpreadAngle = Vector2.new(30, 30)
	emitter.RotSpeed = NumberRange.new(-140, 140)
	emitter.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.18),
		NumberSequenceKeypoint.new(1, 0),
	})
	emitter.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.2),
		NumberSequenceKeypoint.new(0.5, 0.4),
		NumberSequenceKeypoint.new(1, 1),
	})
	emitter.Color = ColorSequence.new(lighten(color, 0.35), lighten(color, 0.8))
	emitter.Parent = parent
	return emitter
end

local function ensurePostEffect(className, name)
	local existing = Lighting:FindFirstChild(name)
	if existing and existing.ClassName == className then
		return existing
	end
	if existing then
		existing:Destroy()
	end
	local created = Instance.new(className)
	created.Name = name
	created.Parent = Lighting
	return created
end

local function applyV4LightingProfile()
	Lighting.Technology = Enum.Technology.Future
	Lighting.Brightness = 3.2
	Lighting.ClockTime = 20.8
	Lighting.GlobalShadows = true
	Lighting.EnvironmentDiffuseScale = 0.25
	Lighting.EnvironmentSpecularScale = 1
	Lighting.OutdoorAmbient = Color3.fromRGB(42, 52, 70)
	Lighting.Ambient = Color3.fromRGB(22, 24, 36)

	local atmosphere = ensurePostEffect("Atmosphere", "TycoonAtmosphere")
	atmosphere.Density = 0.39
	atmosphere.Offset = 0.12
	atmosphere.Color = Color3.fromRGB(124, 144, 173)
	atmosphere.Decay = Color3.fromRGB(39, 47, 66)
	atmosphere.Glare = 0.28
	atmosphere.Haze = 2.1

	local bloom = ensurePostEffect("BloomEffect", "TycoonBloom")
	bloom.Enabled = true
	bloom.Intensity = 0.9
	bloom.Size = 34
	bloom.Threshold = 1.4

	local colorCorrection = ensurePostEffect("ColorCorrectionEffect", "TycoonColorCorrection")
	colorCorrection.Enabled = true
	colorCorrection.Brightness = -0.02
	colorCorrection.Contrast = 0.18
	colorCorrection.Saturation = 0.12
	colorCorrection.TintColor = Color3.fromRGB(206, 224, 255)

	local sunRays = ensurePostEffect("SunRaysEffect", "TycoonSunRays")
	sunRays.Enabled = true
	sunRays.Intensity = 0.06
	sunRays.Spread = 0.65

	local depthOfField = ensurePostEffect("DepthOfFieldEffect", "TycoonDepth")
	depthOfField.Enabled = true
	depthOfField.FarIntensity = 0.08
	depthOfField.FocusDistance = 82
	depthOfField.InFocusRadius = 32
	depthOfField.NearIntensity = 0
end

local function applyV4AudioProfile()
	local folder = SoundService:FindFirstChild("TycoonAudio")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "TycoonAudio"
		folder.Parent = SoundService
	end

	local tracks = {
		{
			Name = "CityHum",
			SoundId = "rbxassetid://1843522434",
			Volume = 0.08,
			Looped = true,
			PlaybackSpeed = 1,
		},
		{
			Name = "FactoryDrone",
			SoundId = "rbxassetid://9118823100",
			Volume = 0.06,
			Looped = true,
			PlaybackSpeed = 0.92,
		},
	}

	for _, track in ipairs(tracks) do
		local sound = folder:FindFirstChild(track.Name)
		if not sound then
			sound = Instance.new("Sound")
			sound.Name = track.Name
			sound.Parent = folder
		end
		sound.SoundId = track.SoundId
		sound.Volume = track.Volume
		sound.Looped = track.Looped
		sound.RollOffMaxDistance = 10000
		sound.PlaybackSpeed = track.PlaybackSpeed
		if not sound.IsPlaying then
			pcall(function()
				sound:Play()
			end)
		end
	end
end

local function addSteam(parent, origin)
	local anchor = createPart(
		"SteamAnchor",
		Vector3.new(0.2, 0.2, 0.2),
		CFrame.new(origin),
		Color3.fromRGB(255, 255, 255),
		Enum.Material.SmoothPlastic,
		parent
	)
	anchor.Transparency = 1
	anchor.CanCollide = false

	local attachment = Instance.new("Attachment")
	attachment.Parent = anchor

	local emitter = Instance.new("ParticleEmitter")
	emitter.Rate = 6
	emitter.Lifetime = NumberRange.new(1.5, 2.4)
	emitter.Speed = NumberRange.new(1.8, 3.5)
	emitter.SpreadAngle = Vector2.new(12, 12)
	emitter.RotSpeed = NumberRange.new(-35, 35)
	emitter.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.5),
		NumberSequenceKeypoint.new(1, 1.6),
	})
	emitter.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.4),
		NumberSequenceKeypoint.new(0.6, 0.65),
		NumberSequenceKeypoint.new(1, 1),
	})
	emitter.Color = ColorSequence.new(Color3.fromRGB(245, 245, 245), Color3.fromRGB(210, 210, 210))
	emitter.Parent = attachment
end

local function addPipe(parent, startPosition, endPosition, color)
	local delta = endPosition - startPosition
	local length = delta.Magnitude
	if length <= 0.05 then
		return
	end
	local midpoint = startPosition + delta * 0.5
	local pipe = createPart(
		"Pipe",
		Vector3.new(0.8, 0.8, length),
		CFrame.lookAt(midpoint, endPosition),
		color,
		Enum.Material.Metal,
		parent
	)
	local endCapA = createBall("PipeJointA", Vector3.new(0.9, 0.9, 0.9), CFrame.new(startPosition), color, Enum.Material.Metal, parent)
	local endCapB = createBall("PipeJointB", Vector3.new(0.9, 0.9, 0.9), CFrame.new(endPosition), color, Enum.Material.Metal, parent)
	pipe.CastShadow = true
	endCapA.CastShadow = true
	endCapB.CastShadow = true
end

local function addRamenBowl(parent, cframe, scale)
	scale = scale or 1
	local bowlColor = Color3.fromRGB(240, 240, 240)
	local brothColor = Color3.fromRGB(176, 102, 56)
	local noodleColor = Color3.fromRGB(236, 209, 110)

	local bowl = createCylinder(
		"Bowl",
		Vector3.new(1.2 * scale, 3.8 * scale, 3.8 * scale),
		cframe * CFrame.Angles(0, 0, math.rad(90)),
		bowlColor,
		Enum.Material.SmoothPlastic,
		parent
	)
	local broth = createCylinder(
		"Broth",
		Vector3.new(1.0 * scale, 3.0 * scale, 3.0 * scale),
		cframe * CFrame.new(0, 0.3 * scale, 0) * CFrame.Angles(0, 0, math.rad(90)),
		brothColor,
		Enum.Material.SmoothPlastic,
		parent
	)
	local noodleA = createPart(
		"NoodleA",
		Vector3.new(2.1 * scale, 0.16 * scale, 0.22 * scale),
		cframe * CFrame.new(-0.2 * scale, 0.58 * scale, 0.28 * scale),
		noodleColor,
		Enum.Material.SmoothPlastic,
		parent
	)
	local noodleB = createPart(
		"NoodleB",
		Vector3.new(2.0 * scale, 0.16 * scale, 0.22 * scale),
		cframe * CFrame.new(0.25 * scale, 0.56 * scale, -0.15 * scale),
		noodleColor,
		Enum.Material.SmoothPlastic,
		parent
	)
	local egg = createBall(
		"Egg",
		Vector3.new(0.5 * scale, 0.5 * scale, 0.5 * scale),
		cframe * CFrame.new(0.65 * scale, 0.68 * scale, 0.45 * scale),
		Color3.fromRGB(245, 229, 167),
		Enum.Material.SmoothPlastic,
		parent
	)
	local onion = createPart(
		"GreenOnion",
		Vector3.new(0.75 * scale, 0.15 * scale, 0.15 * scale),
		cframe * CFrame.new(-0.6 * scale, 0.68 * scale, -0.4 * scale),
		Color3.fromRGB(95, 180, 96),
		Enum.Material.SmoothPlastic,
		parent
	)
	local chashu = createPart(
		"Chashu",
		Vector3.new(0.9 * scale, 0.14 * scale, 0.55 * scale),
		cframe * CFrame.new(0.22 * scale, 0.63 * scale, -0.48 * scale),
		Color3.fromRGB(176, 114, 90),
		Enum.Material.SmoothPlastic,
		parent
	)
	local chopstickA = createPart(
		"ChopstickA",
		Vector3.new(0.08 * scale, 2.1 * scale, 0.08 * scale),
		cframe * CFrame.new(0.95 * scale, 1.15 * scale, 0.32 * scale) * CFrame.Angles(math.rad(-16), 0, math.rad(8)),
		Color3.fromRGB(168, 130, 82),
		Enum.Material.Wood,
		parent
	)
	local chopstickB = createPart(
		"ChopstickB",
		Vector3.new(0.08 * scale, 2.1 * scale, 0.08 * scale),
		cframe * CFrame.new(0.82 * scale, 1.12 * scale, 0.44 * scale) * CFrame.Angles(math.rad(-16), 0, math.rad(8)),
		Color3.fromRGB(168, 130, 82),
		Enum.Material.Wood,
		parent
	)
	bowl.Reflectance = 0.05
	broth.Transparency = 0.08
	noodleA.Material = Enum.Material.SmoothPlastic
	noodleB.Material = Enum.Material.SmoothPlastic
	egg.Material = Enum.Material.SmoothPlastic
	onion.Material = Enum.Material.SmoothPlastic
	chashu.Material = Enum.Material.SmoothPlastic
	chopstickA.CastShadow = true
	chopstickB.CastShadow = true
end

local function addDecorativeFacade(parent, origin, accentColor)
	local backWall = createPart(
		"BackWall",
		Vector3.new(126, 24, 2),
		CFrame.new(origin + Vector3.new(0, 12, -68)),
		Color3.fromRGB(30, 34, 46),
		Enum.Material.Metal,
		parent
	)
	local awning = createPart(
		"Awning",
		Vector3.new(112, 2, 14),
		CFrame.new(origin + Vector3.new(0, 18, -61)),
		Color3.fromRGB(36, 40, 58),
		Enum.Material.Metal,
		parent
	)
	local neonSign = createPart(
		"NeonSign",
		Vector3.new(34, 4, 0.5),
		CFrame.new(origin + Vector3.new(0, 14, -66.7)),
		lighten(accentColor, 0.2),
		Enum.Material.Neon,
		parent
	)
	createBillboard(neonSign, "NEON NOODLE WORKS", Color3.fromRGB(255, 255, 255))
	addPointLight(neonSign, lighten(accentColor, 0.25), 1.2, 26)

	for index = -2, 2 do
		local window = createPart(
			("Window_%d"):format(index),
			Vector3.new(16, 7, 0.35),
			CFrame.new(origin + Vector3.new(index * 21, 9, -66.6)),
			Color3.fromRGB(102, 176, 235),
			Enum.Material.Glass,
			parent
		)
		window.Transparency = 0.3
	end

	backWall.CastShadow = true
	awning.CastShadow = true
end

local function addPlotPerimeter(parent, origin)
	local curbColor = Color3.fromRGB(75, 81, 96)
	local wallColor = Color3.fromRGB(46, 50, 64)

	createPart("CurbNorth", Vector3.new(138, 1, 3), CFrame.new(origin + Vector3.new(0, 0.6, -68)), curbColor, Enum.Material.Concrete, parent)
	createPart("CurbSouth", Vector3.new(138, 1, 3), CFrame.new(origin + Vector3.new(0, 0.6, 68)), curbColor, Enum.Material.Concrete, parent)
	createPart("CurbWest", Vector3.new(3, 1, 132), CFrame.new(origin + Vector3.new(-68, 0.6, 0)), curbColor, Enum.Material.Concrete, parent)
	createPart("CurbEast", Vector3.new(3, 1, 132), CFrame.new(origin + Vector3.new(68, 0.6, 0)), curbColor, Enum.Material.Concrete, parent)

	createPart("FenceNorth", Vector3.new(138, 7, 1), CFrame.new(origin + Vector3.new(0, 4.5, -69.5)), wallColor, Enum.Material.Metal, parent)
	createPart("FenceSouth", Vector3.new(138, 7, 1), CFrame.new(origin + Vector3.new(0, 4.5, 69.5)), wallColor, Enum.Material.Metal, parent)
	createPart("FenceWest", Vector3.new(1, 7, 132), CFrame.new(origin + Vector3.new(-69.5, 4.5, 0)), wallColor, Enum.Material.Metal, parent)
	createPart("FenceEast", Vector3.new(1, 7, 132), CFrame.new(origin + Vector3.new(69.5, 4.5, 0)), wallColor, Enum.Material.Metal, parent)
end

local function addWorkshopProps(parent, origin)
	for rackIndex = 1, 3 do
		local xOffset = -38 + rackIndex * 18
		local rack = createPart(
			("Rack_%d"):format(rackIndex),
			Vector3.new(10, 7, 3),
			CFrame.new(origin + Vector3.new(xOffset, 4, 52)),
			Color3.fromRGB(58, 63, 79),
			Enum.Material.Metal,
			parent
		)
		for shelf = 1, 3 do
			createPart(
				("RackShelf_%d_%d"):format(rackIndex, shelf),
				Vector3.new(10.2, 0.35, 3.2),
				CFrame.new(origin + Vector3.new(xOffset, 1 + shelf * 2, 52)),
				Color3.fromRGB(70, 76, 94),
				Enum.Material.Metal,
				parent
			)
		end
		rack.CastShadow = true
		addRamenBowl(parent, CFrame.new(origin + Vector3.new(xOffset, 7.8, 52)), 0.55)
	end

	local pallet = createPart(
		"IngredientPallet",
		Vector3.new(16, 1, 10),
		CFrame.new(origin + Vector3.new(34, 1, 50)),
		Color3.fromRGB(121, 97, 66),
		Enum.Material.WoodPlanks,
		parent
	)
	pallet.CastShadow = true
	for crateIndex = 1, 4 do
		local crate = createPart(
			("Crate_%d"):format(crateIndex),
			Vector3.new(3.2, 3.2, 3.2),
			CFrame.new(origin + Vector3.new(28 + crateIndex * 2.7, 2.6, 49 + (crateIndex % 2) * 2)),
			Color3.fromRGB(148, 112, 70),
			Enum.Material.Wood,
			parent
		)
		crate.CastShadow = true
	end
end

local function addStreetLamp(parent, cframe, tint)
	local pole = createPart("LampPole", Vector3.new(1, 12, 1), cframe * CFrame.new(0, 6, 0), Color3.fromRGB(63, 68, 83), Enum.Material.Metal, parent)
	local arm = createPart("LampArm", Vector3.new(0.6, 0.6, 4.2), pole.CFrame * CFrame.new(0, 5, -1.7), Color3.fromRGB(66, 71, 88), Enum.Material.Metal, parent)
	local lamp = createPart("LampHead", Vector3.new(2.2, 0.8, 2.2), arm.CFrame * CFrame.new(0, 0, -2), tint, Enum.Material.Neon, parent)
	addPointLight(lamp, tint, 1.9, 46)
	pole.CastShadow = true
	arm.CastShadow = true
	lamp.CastShadow = false
end

local function addRoadDetails(parent)
	for index = -6, 6 do
		local offset = index * 62
		local puddleA = createPart(
			("PuddleA_%d"):format(index),
			Vector3.new(18, 0.08, 9),
			CFrame.new(offset + 24, -1.38, -18),
			Color3.fromRGB(95, 129, 173),
			Enum.Material.Glass,
			parent
		)
		puddleA.Transparency = 0.45

		local puddleB = createPart(
			("PuddleB_%d"):format(index),
			Vector3.new(14, 0.08, 7),
			CFrame.new(-18, -1.38, offset + 26),
			Color3.fromRGB(105, 135, 178),
			Enum.Material.Glass,
			parent
		)
		puddleB.Transparency = 0.5
	end

	for lane = -3, 3 do
		addStreetLamp(parent, CFrame.new(-430, 0, lane * 120), Color3.fromRGB(121, 188, 255))
		addStreetLamp(parent, CFrame.new(430, 0, lane * 120), Color3.fromRGB(121, 188, 255))
		addStreetLamp(parent, CFrame.new(lane * 120, 0, -430), Color3.fromRGB(255, 195, 120))
		addStreetLamp(parent, CFrame.new(lane * 120, 0, 430), Color3.fromRGB(255, 195, 120))
	end
end

function TycoonFactory.ResetPlotBuild(plot)
	for _, child in ipairs(plot.BuildFolder:GetChildren()) do
		child:Destroy()
	end
end

function TycoonFactory.SetOwnerVisual(plot, ownerText, color)
	plot.SignLabel.Text = ownerText
	plot.SignLabel.TextColor3 = color
end

function TycoonFactory.SetButtonState(plot, unlockId, state, displayName, cost)
	local button = plot.ButtonsById[unlockId]
	if not button then
		return
	end

	if state == "hidden" then
		button.Part.Transparency = 1
		button.Part.CanCollide = false
		button.Prompt.Enabled = false
		button.Label.Text = displayName
		return
	end

	if state == "locked" then
		button.Part.Transparency = 0.85
		button.Part.CanCollide = false
		button.Prompt.Enabled = false
		button.Label.Text = ("[LOCKED] %s"):format(displayName)
		return
	end

	button.Part.Transparency = 0.15
	button.Part.CanCollide = true
	button.Prompt.Enabled = true
	button.Prompt.ActionText = ("Acheter $%d"):format(cost)
	button.Label.Text = ("%s\n$%d"):format(displayName, cost)
end

function TycoonFactory.SetResearchState(plot, researchId, state, displayName, currentLevel, maxLevel, costShards)
	local research = plot.ResearchById[researchId]
	if not research then
		return
	end

	if state == "hidden" then
		research.Part.Transparency = 1
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = displayName
		return
	end

	if state == "locked" then
		research.Part.Transparency = 0.8
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = ("[LOCKED] %s L%d/%d"):format(displayName, currentLevel, maxLevel)
		return
	end

	if state == "maxed" then
		research.Part.Transparency = 0.3
		research.Part.CanCollide = false
		research.Prompt.Enabled = false
		research.Label.Text = ("[MAX] %s L%d/%d"):format(displayName, currentLevel, maxLevel)
		return
	end

	research.Part.Transparency = 0.08
	research.Part.CanCollide = true
	research.Prompt.Enabled = true
	research.Prompt.ActionText = ("Upgrade %d shards"):format(costShards)
	research.Label.Text = ("%s\nL%d/%d - %d shards"):format(displayName, currentLevel, maxLevel, costShards)
end

function TycoonFactory.SetOverclockState(plot, text, enabled, color)
	plot.OverclockPrompt.Enabled = enabled
	plot.OverclockLabel.Text = text
	if color then
		plot.OverclockPad.Color = color
	end
end

function TycoonFactory.SetPlotUnclaimed(plot)
	plot.OwnerUserId = nil
	plot.ClaimPrompt.Enabled = true
	plot.CollectorPrompt.Enabled = false
	plot.RebirthPrompt.Enabled = false
	plot.OverclockPrompt.Enabled = false
	plot.OverclockLabel.Text = "Overclock verrouille"
	TycoonFactory.SetOwnerVisual(plot, "PLOT LIBRE", Color3.fromRGB(255, 255, 255))

	for unlockId, button in pairs(plot.ButtonsById) do
		button.Part.Transparency = 1
		button.Prompt.Enabled = false
		button.Label.Text = unlockId
	end
	for researchId, research in pairs(plot.ResearchById) do
		research.Part.Transparency = 1
		research.Prompt.Enabled = false
		research.Label.Text = researchId
	end
	TycoonFactory.ResetPlotBuild(plot)
end

function TycoonFactory.BuildUnlock(plot, unlock)
	if plot.BuildFolder:FindFirstChild(unlock.Id) then
		return
	end

	local model = Instance.new("Model")
	model.Name = unlock.Id
	model.Parent = plot.BuildFolder

	local seed = hashFromText(unlock.Id)
	local baseCFrame = CFrame.new(plot.Origin + unlock.BuildPosition)
	local accent = unlock.Color or Color3.fromRGB(255, 255, 255)
	local primaryMetal = darken(accent, 0.55)
	local secondaryMetal = darken(accent, 0.35)

	local platform = createPart(
		"Platform",
		Vector3.new(12, 1.2, 12),
		baseCFrame,
		primaryMetal,
		Enum.Material.Metal,
		model
	)
	platform.CastShadow = true

	createPart("TrimFront", Vector3.new(12.2, 0.8, 0.9), platform.CFrame * CFrame.new(0, 0.95, 5.45), accent, Enum.Material.Neon, model)
	createPart("TrimBack", Vector3.new(12.2, 0.8, 0.9), platform.CFrame * CFrame.new(0, 0.95, -5.45), accent, Enum.Material.Neon, model)

	for _, corner in ipairs({
		Vector3.new(4.9, 1.9, 4.9),
		Vector3.new(-4.9, 1.9, 4.9),
		Vector3.new(4.9, 1.9, -4.9),
		Vector3.new(-4.9, 1.9, -4.9),
	}) do
		createPart("Foot", Vector3.new(1, 3.8, 1), platform.CFrame * CFrame.new(corner), secondaryMetal, Enum.Material.Metal, model)
	end

	local bodyHeight = 5 + (seed % 3)
	local machineBody = createPart(
		"MachineBody",
		Vector3.new(7.2, bodyHeight, 6.4),
		platform.CFrame * CFrame.new(0, 1.2 + bodyHeight * 0.5, 0),
		secondaryMetal,
		Enum.Material.Metal,
		model
	)
	machineBody.CastShadow = true

	local machineHum = Instance.new("Sound")
	machineHum.Name = "MachineHum"
	machineHum.SoundId = "rbxassetid://9118823100"
	machineHum.Volume = 0.04
	machineHum.Looped = true
	machineHum.RollOffMaxDistance = 68
	machineHum.PlaybackSpeed = 0.85 + (seed % 25) / 100
	machineHum.Parent = machineBody
	pcall(function()
		machineHum:Play()
	end)

	local glassPanel = createPart(
		"GlassPanel",
		Vector3.new(5.8, 2.6, 0.25),
		machineBody.CFrame * CFrame.new(0, 0.4, 3.3),
		lighten(accent, 0.3),
		Enum.Material.Glass,
		model
	)
	glassPanel.Transparency = 0.4

	local neonStrip = createPart(
		"StatusStrip",
		Vector3.new(5.4, 0.35, 0.2),
		machineBody.CFrame * CFrame.new(0, 1.2, 3.05),
		lighten(accent, 0.1),
		Enum.Material.Neon,
		model
	)
	neonStrip.CastShadow = false
	addPointLight(neonStrip, lighten(accent, 0.25), 1.3, 20)

	local monitor = createPart(
		"ControlMonitor",
		Vector3.new(2.8, 1.8, 0.2),
		machineBody.CFrame * CFrame.new(-2.0, 0.2, 3.15),
		Color3.fromRGB(88, 186, 245),
		Enum.Material.Neon,
		model
	)
	monitor.CastShadow = false

	if unlock.Income and unlock.Income > 0 then
		local dropTower = createPart(
			"DropTower",
			Vector3.new(1.8, bodyHeight + 2.8, 1.8),
			machineBody.CFrame * CFrame.new(2.4, 1.5, -1.6),
			lighten(accent, 0.15),
			Enum.Material.Metal,
			model
		)
		local nozzle = createCylinder(
			"Nozzle",
			Vector3.new(1.2, 1.2, 1.2),
			dropTower.CFrame * CFrame.new(0, -(bodyHeight + 2.8) * 0.5 + 0.45, 0) * CFrame.Angles(0, 0, math.rad(90)),
			Color3.fromRGB(213, 214, 216),
			Enum.Material.Metal,
			model
		)
		local flow = createPart(
			"NoodleFlow",
			Vector3.new(0.35, 1.9, 0.35),
			nozzle.CFrame * CFrame.new(0, -1.25, 0),
			Color3.fromRGB(236, 209, 110),
			Enum.Material.Neon,
			model
		)
		flow.CastShadow = false
		addSparkParticles(flow, Color3.fromRGB(241, 224, 148))

		local conveyor = createPart(
			"MiniConveyor",
			Vector3.new(5.4, 0.5, 2.3),
			machineBody.CFrame * CFrame.new(0.3, -bodyHeight * 0.5 - 0.1, 2.7),
			Color3.fromRGB(46, 48, 58),
			Enum.Material.Metal,
			model
		)
		createCylinder(
			"ConveyorRollA",
			Vector3.new(2.2, 0.9, 0.9),
			conveyor.CFrame * CFrame.new(-2.45, 0.1, 0) * CFrame.Angles(0, 0, math.rad(90)),
			Color3.fromRGB(92, 92, 96),
			Enum.Material.Metal,
			model
		)
		createCylinder(
			"ConveyorRollB",
			Vector3.new(2.2, 0.9, 0.9),
			conveyor.CFrame * CFrame.new(2.45, 0.1, 0) * CFrame.Angles(0, 0, math.rad(90)),
			Color3.fromRGB(92, 92, 96),
			Enum.Material.Metal,
			model
		)
		addRamenBowl(model, conveyor.CFrame * CFrame.new(1.2, 0.55, 0), 0.8)
	end

	if unlock.MultiplierBonus and unlock.MultiplierBonus > 0 then
		local ring = createCylinder(
			"UpgradeRing",
			Vector3.new(1.0, 8.2, 8.2),
			machineBody.CFrame * CFrame.new(0, bodyHeight * 0.25 + 1.1, 0) * CFrame.Angles(0, 0, math.rad(90)),
			Color3.fromRGB(255, 201, 82),
			Enum.Material.Neon,
			model
		)
		ring.Transparency = 0.12
		local orb = createBall(
			"CatalystOrb",
			Vector3.new(1.6, 1.6, 1.6),
			ring.CFrame * CFrame.new(0, 0, 4.1),
			lighten(accent, 0.45),
			Enum.Material.Neon,
			model
		)
		orb.CastShadow = false
		addPointLight(orb, lighten(accent, 0.2), 1.6, 18)
		addSparkParticles(orb, Color3.fromRGB(255, 218, 149))
	end

	if string.find(unlock.Id, "Lab") or string.find(unlock.Id, "Reactor") or string.find(unlock.Id, "Engine") then
		local tank = createCylinder(
			"FluidTank",
			Vector3.new(4.8, 3.1, 3.1),
			machineBody.CFrame * CFrame.new(-2.8, 1.0, -1.8) * CFrame.Angles(0, 0, math.rad(90)),
			Color3.fromRGB(112, 193, 225),
			Enum.Material.Glass,
			model
		)
		tank.Transparency = 0.3
		createCylinder(
			"FluidCore",
			Vector3.new(4.1, 2.2, 2.2),
			tank.CFrame,
			lighten(accent, 0.35),
			Enum.Material.Neon,
			model
		).Transparency = 0.2
		addPipe(
			model,
			(machineBody.CFrame * CFrame.new(-1.2, 1.8, -1.6)).Position,
			(machineBody.CFrame * CFrame.new(1.8, 2.2, 1.7)).Position,
			Color3.fromRGB(178, 182, 191)
		)
	end

	if string.find(unlock.Id, "Conveyor") then
		local longConveyor = createPart(
			"LongConveyor",
			Vector3.new(10, 0.7, 2.4),
			platform.CFrame * CFrame.new(0, 0.95, -4.2),
			Color3.fromRGB(45, 49, 61),
			Enum.Material.Metal,
			model
		)
		createPart(
			"ConveyorBelt",
			Vector3.new(9.6, 0.12, 2.0),
			longConveyor.CFrame * CFrame.new(0, 0.38, 0),
			Color3.fromRGB(32, 34, 43),
			Enum.Material.SmoothPlastic,
			model
		)
	end

	if string.find(unlock.Id, "Kitchen") or string.find(unlock.Id, "Forge") or string.find(unlock.Id, "Core") then
		local canopy = createPart(
			"Canopy",
			Vector3.new(9.8, 0.6, 6.2),
			machineBody.CFrame * CFrame.new(0, bodyHeight * 0.5 + 1.2, 0),
			darken(accent, 0.2),
			Enum.Material.Metal,
			model
		)
		addSteam(model, canopy.Position + Vector3.new(0, 0.6, 0))
		addPointLight(canopy, lighten(accent, 0.2), 0.8, 15)
	end

	local bowlStation = createPart(
		"BowlStation",
		Vector3.new(3.6, 1.0, 3.6),
		platform.CFrame * CFrame.new(-3.2, 1.25, 3.1),
		Color3.fromRGB(78, 84, 103),
		Enum.Material.Metal,
		model
	)
	addRamenBowl(model, bowlStation.CFrame * CFrame.new(0, 0.7, 0), 0.62)

	local labelAnchor = createPart(
		"LabelAnchor",
		Vector3.new(0.4, 5.2, 0.4),
		machineBody.CFrame * CFrame.new(0, bodyHeight * 0.5 + 2.9, 0),
		Color3.fromRGB(255, 255, 255),
		Enum.Material.SmoothPlastic,
		model
	)
	labelAnchor.Transparency = 1
	labelAnchor.CanCollide = false
	createBillboard(labelAnchor, unlock.DisplayName, Color3.fromRGB(255, 255, 255))
end

function TycoonFactory.CreateWorld()
	applyV4LightingProfile()
	applyV4AudioProfile()

	local old = workspace:FindFirstChild("NeonNoodleTycoonWorld")
	if old then
		old:Destroy()
	end

	local root = Instance.new("Folder")
	root.Name = "NeonNoodleTycoonWorld"
	root.Parent = workspace

	local ground = createPart(
		"Ground",
		Vector3.new(980, 1, 980),
		CFrame.new(0, -2, 0),
		Color3.fromRGB(18, 19, 27),
		Enum.Material.Asphalt,
		root
	)
	ground.CastShadow = false

	createPart(
		"CentralRoadX",
		Vector3.new(860, 0.2, 20),
		CFrame.new(0, -1.45, 0),
		Color3.fromRGB(32, 34, 43),
		Enum.Material.Asphalt,
		root
	)
	createPart(
		"CentralRoadZ",
		Vector3.new(20, 0.2, 860),
		CFrame.new(0, -1.45, 0),
		Color3.fromRGB(32, 34, 43),
		Enum.Material.Asphalt,
		root
	)

	for marker = -7, 7 do
		createPart(
			("RoadMarkerX_%d"):format(marker),
			Vector3.new(12, 0.05, 1.1),
			CFrame.new(marker * 56, -1.34, 0),
			Color3.fromRGB(245, 230, 140),
			Enum.Material.Neon,
			root
		)
		createPart(
			("RoadMarkerZ_%d"):format(marker),
			Vector3.new(1.1, 0.05, 12),
			CFrame.new(0, -1.34, marker * 56),
			Color3.fromRGB(245, 230, 140),
			Enum.Material.Neon,
			root
		)
	end

	addRoadDetails(root)

	local plots = {}
	local columns = 2
	local rows = math.ceil(TycoonConfig.PlotCount / columns)
	local xStart = -((columns - 1) * TycoonConfig.PlotSpacing) / 2
	local zStart = -((rows - 1) * TycoonConfig.PlotSpacing) / 2

	for index = 1, TycoonConfig.PlotCount do
		local row = math.floor((index - 1) / columns)
		local col = (index - 1) % columns
		local origin = Vector3.new(xStart + col * TycoonConfig.PlotSpacing, 0, zStart + row * TycoonConfig.PlotSpacing)

		local plotModel = Instance.new("Model")
		plotModel.Name = ("Plot_%d"):format(index)
		plotModel.Parent = root

		local floor = createPart(
			"Floor",
			Vector3.new(140, 1, 140),
			CFrame.new(origin + Vector3.new(0, 0, 0)),
			Color3.fromRGB(34, 37, 51),
			Enum.Material.Concrete,
			plotModel
		)
		floor.CastShadow = false

		addPlotPerimeter(plotModel, origin)
		local plotAccent = Color3.fromRGB(90 + index * 20, 190, 255 - index * 18)
		addDecorativeFacade(plotModel, origin, plotAccent)
		addWorkshopProps(plotModel, origin)

		local claimPad = createPart(
			"ClaimPad",
			Vector3.new(12, 1, 12),
			CFrame.new(origin + Vector3.new(-50, 1, 54)),
			Color3.fromRGB(67, 255, 170),
			Enum.Material.Neon,
			plotModel
		)
		createPart("ClaimPadBase", Vector3.new(14, 1, 14), claimPad.CFrame * CFrame.new(0, -0.75, 0), Color3.fromRGB(58, 67, 74), Enum.Material.Metal, plotModel)
		local claimPrompt = createPrompt(claimPad, "Prendre", "Tycoon libre")

		local collector = createPart(
			"Collector",
			Vector3.new(12, 1, 12),
			CFrame.new(origin + Vector3.new(50, 1, 54)),
			Color3.fromRGB(255, 226, 87),
			Enum.Material.Neon,
			plotModel
		)
		createPart("CollectorBase", Vector3.new(14, 1, 14), collector.CFrame * CFrame.new(0, -0.75, 0), Color3.fromRGB(72, 68, 45), Enum.Material.Metal, plotModel)
		local collectorPrompt = createPrompt(collector, "Collecter", "Cash non collecte")
		collectorPrompt.Enabled = false

		local rebirthPad = createPart(
			"RebirthPad",
			Vector3.new(14, 1, 14),
			CFrame.new(origin + Vector3.new(50, 1, -54)),
			Color3.fromRGB(255, 94, 94),
			Enum.Material.Neon,
			plotModel
		)
		createPart("RebirthBase", Vector3.new(16, 1, 16), rebirthPad.CFrame * CFrame.new(0, -0.75, 0), Color3.fromRGB(82, 47, 47), Enum.Material.Metal, plotModel)
		local rebirthPrompt = createPrompt(rebirthPad, "Renaitre", "Prestige")
		rebirthPrompt.Enabled = false

		local overclockPad = createPart(
			"OverclockPad",
			Vector3.new(14, 1, 14),
			CFrame.new(origin + Vector3.new(0, 1, 56)),
			Color3.fromRGB(136, 175, 255),
			Enum.Material.Neon,
			plotModel
		)
		createPart("OverclockBase", Vector3.new(16, 1, 16), overclockPad.CFrame * CFrame.new(0, -0.75, 0), Color3.fromRGB(54, 65, 89), Enum.Material.Metal, plotModel)
		local overclockPrompt = createPrompt(overclockPad, "Overclock", "Boost temporaire")
		overclockPrompt.Enabled = false
		local overclockLabel = createBillboard(overclockPad, "Overclock verrouille", Color3.fromRGB(255, 255, 255))

		local sign = createPart(
			"OwnerSign",
			Vector3.new(30, 10, 2),
			CFrame.new(origin + Vector3.new(-50, 8, 60)),
			Color3.fromRGB(44, 51, 73),
			Enum.Material.Metal,
			plotModel
		)
		local signLabel = createBillboard(sign, "PLOT LIBRE", Color3.fromRGB(255, 255, 255))

		local buildFolder = Instance.new("Folder")
		buildFolder.Name = "Build"
		buildFolder.Parent = plotModel

		local buttonFolder = Instance.new("Folder")
		buttonFolder.Name = "Buttons"
		buttonFolder.Parent = plotModel

		local buttonsById = {}
		local nonStarterUnlocks = {}
		for _, unlock in ipairs(TycoonConfig.Unlocks) do
			if not unlock.Starter then
				table.insert(nonStarterUnlocks, unlock)
			end
		end

		local totalButtons = #nonStarterUnlocks
		for buttonIndex, unlock in ipairs(nonStarterUnlocks) do
			local angle = ((buttonIndex - 1) / math.max(1, totalButtons)) * math.pi * 2
			local radius = 53
			local position = origin + Vector3.new(math.cos(angle) * radius, 1, math.sin(angle) * radius)

			local pedestal = createPart(
				("ButtonPedestal_%s"):format(unlock.Id),
				Vector3.new(9, 1, 9),
				CFrame.new(position + Vector3.new(0, -0.65, 0)),
				Color3.fromRGB(52, 56, 71),
				Enum.Material.Metal,
				buttonFolder
			)
			pedestal.CastShadow = true

			local buttonPart = createPart(
				("Button_%s"):format(unlock.Id),
				Vector3.new(8, 1, 8),
				CFrame.new(position),
				unlock.Color or Color3.fromRGB(255, 255, 255),
				Enum.Material.Neon,
				buttonFolder
			)
			buttonPart.Transparency = 1
			buttonPart.CanCollide = false

			local prompt = createPrompt(buttonPart, "Acheter", unlock.DisplayName)
			prompt.Enabled = false

			local label = createBillboard(buttonPart, unlock.DisplayName, Color3.fromRGB(255, 255, 255))
			buttonsById[unlock.Id] = {
				Part = buttonPart,
				Prompt = prompt,
				Label = label,
			}
		end

		local researchFolder = Instance.new("Folder")
		researchFolder.Name = "Research"
		researchFolder.Parent = plotModel

		local researchById = {}
		local researchCount = #TycoonConfig.ResearchUpgrades
		for researchIndex, researchUpgrade in ipairs(TycoonConfig.ResearchUpgrades) do
			local spread = 100 / math.max(1, researchCount - 1)
			local xOffset = -50 + (researchIndex - 1) * spread
			local position = origin + Vector3.new(xOffset, 1, -56)

			createPart(
				("ResearchPedestal_%s"):format(researchUpgrade.Id),
				Vector3.new(17.2, 1, 11.2),
				CFrame.new(position + Vector3.new(0, -0.65, 0)),
				Color3.fromRGB(58, 53, 78),
				Enum.Material.Metal,
				researchFolder
			)

			local researchPart = createPart(
				("Research_%s"):format(researchUpgrade.Id),
				Vector3.new(16, 1, 10),
				CFrame.new(position),
				Color3.fromRGB(255, 133, 244),
				Enum.Material.Neon,
				researchFolder
			)
			researchPart.Transparency = 1
			researchPart.CanCollide = false

			local prompt = createPrompt(researchPart, "Upgrade", researchUpgrade.DisplayName)
			prompt.Enabled = false

			local label = createBillboard(researchPart, researchUpgrade.DisplayName, Color3.fromRGB(255, 255, 255))
			researchById[researchUpgrade.Id] = {
				Part = researchPart,
				Prompt = prompt,
				Label = label,
			}
		end

		plots[index] = {
			Index = index,
			Model = plotModel,
			Floor = floor,
			Origin = origin,
			OwnerUserId = nil,
			SignLabel = signLabel,
			ClaimPrompt = claimPrompt,
			CollectorPrompt = collectorPrompt,
			RebirthPrompt = rebirthPrompt,
			OverclockPad = overclockPad,
			OverclockPrompt = overclockPrompt,
			OverclockLabel = overclockLabel,
			ButtonsById = buttonsById,
			ResearchById = researchById,
			BuildFolder = buildFolder,
		}

		TycoonFactory.SetPlotUnclaimed(plots[index])
	end

	return root, plots
end

return TycoonFactory
