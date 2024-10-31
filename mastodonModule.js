
//=========================================//
//============ START OF MODULE ============//
//=============== Version 1.0 ================//


module.exports.getDateTime = (str) => {
	df = new DateFormatter()
	df.dateFormat = 'dd.MM.YY, HH:mm'
 return df.string(new Date(str))
};


// Finds the user ID of the given user
module.exports.getUserID = async (name, instance) => {
	req =  await new Request(`https://${ instance }/api/v1/accounts/lookup?acct=@${ name }`).loadJSON()
	id = req.id
 return id
};


// generate full mastodon username (e. g.: @iamrbn@mastodon.social)
module.exports.createUserName = async (str) => {
  str2 = str.replace('https:', '').replaceAll('/', '')
  str3 = str2.split('@')
  tag = '@'+str3[1]+'@'+str3[0]
  return tag 
};

// Loads image from given URL
module.exports.loadImage = async (imgURL) => {
  return await new Request(imgURL).loadImage()
};


// Loads Images from iCloud
module.exports.getImage = async (fm, dir, name) => {
	imgPath = fm.joinPath(dir, name + ".png")
	await fm.downloadFileFromiCloud(imgPath)
	img = await fm.readImage(imgPath)
  
 return Image.fromFile(imgPath)
};

/*
module.exports.emojiFinder =  async (string, userInstance) => {
  let img;
  try {
    emojiName = string.match(/(?<=:)\w+\D(?=:)/g)
    emojis = await new Request(`https://${ userInstance }/api/v1/custom_emojis`).loadJSON()
    emoji = emojis.filter(item => item.shortcode == emojiName)
    img = await new Request(emoji[0].url).loadImage()
  } catch(error) {
    img = error.message
  }
 //return await loadImage(emoji[0].url)
  return img
};*/

module.exports.emojCreator =  async (string, userInstance, base) => {
  let displayName = base.addText(string.replace(/(?<=:)\w+\D(?=:)/g, '').replace(/[:]/g, ""))
       displayName.font = Font.boldRoundedSystemFont(20)
       displayName.minimumScaleFactor = 0.7
       
  let img;
  try {
    emojiName = string.match(/(?<=:)\w+\D(?=:)/g)
    emojis = await new Request(`https://${ userInstance }/api/v1/custom_emojis`).loadJSON()
    emoji = emojis.filter(item => item.shortcode == emojiName)
    img = await new Request(emoji[0].url).loadImage()
    image = base.addImage(img)
    image.imageSize = new Size(25, 25)
} catch(error) {
    console.log(error.message)
  }
};


// Draws a line
module.exports.drawLine = (characters) => {
  log({characters})
  
  if (characters < 50) length = characters + 50
  else if (characters < 150) length = characters - 45
  else if (characters > 150) length = characters - 110
  else length = characters - 0
  
  log({length})
  
  canvas = new DrawContext()
  canvas.opaque = false
  canvas.size = new Size(80, 400)
  path = new Path()
  path.move(new Point(40, 40))
  path.addLine(new Point(40, length))
  canvas.addPath(path)
  canvas.setStrokeColor(Color.lightGray())
  canvas.setLineWidth(2)
  canvas.strokePath()
 
  return canvas.getImage()
};


module.exports.notificationScheduler = (df, res, body, reblogBody, nKey, userName) => {
 applicationName = (res[0].application == null) ? "" : res[0].application.name
 if (res[0].media_attachments[0] == undefined){
    imgURLStr = res[0].account.avatar
    imgHeigth = 375
 } else {
    imgURLStr = res[0].media_attachments[0].url
    imgHeigth = res[0].media_attachments[0].meta.small.height
    imgDesc = 'ALT: ' + res[0].media_attachments[0].description
    console.warn({imgHeigth})
 };

if (res[0].media_attachments[0] != undefined && res[0].media_attachments[0].description != null) imgDesc = "ALT: " + res[0].media_attachments[0].description
else imgDesc = ''

 n = new Notification()
 n.title = res[0].account.display_name.replace(/(?<=:)\w+\D(?=:)/g, '').replace(/[:]/g, "")
 n.subtitle = df.string(new Date(res[0].created_at)) + " Uhr " + applicationName
 //log(res[0].content)
 if (res[0].reblog == null){
     n.body = body + imgDesc
     n.openURL = res[0].url
 } else {
     n.body = reblogBody
     n.openURL = res[0].reblog.url
 }
 n.addAction("@"+res[0].account.username, res[0].account.url)
 for (i=0; i<res[0].mentions.length; i++) n.addAction(res[0].mentions[i].acct, res[0].mentions[i].url)
 n.identifier = res[0].id
 n.userInfo = {"url":imgURLStr,"desc":imgDesc,"id":res[0].id}
 n.threadIdentifier = Script.name()
 n.preferredContentHeight = imgHeigth
 n.scriptName = Script.name()
 n.schedule()
     
 nKey.set(`${ userName }_post_id`, res[0].id)
};


// creates footer for likes, comments etc.
module.exports.getCounts = (stack, symbol, number, size, spacer) => {
  cStack = stack.addStack()
  cStack.centerAlignContent()
  cStack.spacing = 2
  cStack.addSpacer(spacer)
  sf = SFSymbol.named(symbol)
  sf.applySemiboldWeight()
  
  img = cStack.addImage(sf.image)
  img.tintColor = Color.lightGray()
  img.imageSize = new Size(size, size)
  
  countNmbr = cStack.addText(number.toString())
  countNmbr.font = Font.lightMonospacedSystemFont(size-2)
  countNmbr.textColor = Color.lightGray()
  
  cStack.addSpacer(spacer)
};


//Checks if's there an server update on GitHub available
module.exports.updateCheck = async (fm, modulePath, version) => {
  url = 'https://raw.githubusercontent.com/iamrbn/Mastodon-Widget/main/'
  endpoints = ['Mastodon-Widget.js', 'mastodonModule.js']
  
    let uC
    try {
      updateCheck = new Request(url+endpoints[0]+'on')
      uC = await updateCheck.loadJSON()
    } catch (e){
        return log(e)
    }

  needUpdate = false
  if (uC.version > version){
      needUpdate = true
    if (config.runsInApp){
      //console.error(`New Server Version ${uC.version} Available`)
          newAlert = new Alert()
          newAlert.title = `New Server Version ${uC.version} Available!`
          newAlert.addAction("OK")
          newAlert.addDestructiveAction("Later")
          newAlert.message="Changes:\n" + uC.notes + "\n\nOK starts the download from GitHub\n More informations about the update changes go to the GitHub Repo"
      if (await newAlert.present() == 0){
        	reqCode = new Request(url+endpoints[0])
        	updatedCode = await reqCode.loadString()
        	pathCode = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        	fm.writeString(pathCode, updatedCode)
        	reqModule = new Request(url+endpoints[1])
        	moduleFile = await reqModule.loadString()
        	fm.writeString(modulePath, moduleFile)
        	throw new Error("Update Complete!")
      }
    }
  } else log("\n>> SCRIPT IS UP TO DATE!")
  
  return {uC, needUpdate}
};


//=========================================//
//============= END OF MODULE =============//
//=========================================//
