//find user ID: https://mastodon.social/api/v1/accounts/lookup?acct=@{USERNAME}

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: bullhorn;
// created by: iamrbn
// github repo: https://github.com/iamrbn/Mastodon-Widget


//=========================================//
//=========== START CONFIG ZONE ===========//

var CONFIGS = {
      DEVICES: {
       iPad: {
        notifications: false, //true: Allow new Pushnotifications, opposite 'false'
        refreshInt: 60
        },
       iPhone: {
        notifications: true,
        refreshInt: 60
        }
     }
};

let roundProfileImages = true
let reposts = false
let favUsers = [
      'simonbs@mastodon.social',
      'christianselig@mastodon.social',
      'elhotzo@mastodon.social',
      'icesck@mastodon.social',
      'iamrbn@mastodon.social',
      'mammoth@moth.social',
      'ivory@tapbots.social',
      'mvan231@mastodon.social',
      'IceCubesApp@mastodon.online'
     ];

//============ END CONFIG ZONE ============//
//=========================================//


let nKey = Keychain
let wSize = config.widgetFamily
let fm = FileManager.iCloud()
let dir = fm.joinPath(fm.documentsDirectory(), 'Mastodon-Widget')
if (!fm.fileExists(dir)) fm.createDirectory(dir)
let modulePath = fm.joinPath(dir, "mastodonModule.js")
if (!fm.fileExists(modulePath)) await loadModule()
let mModule = importModule(modulePath)
if (!fm.isFileDownloaded(modulePath)) await fm.downloadFileFromiCloud(modulePath)
let uCheck = await mModule.updateCheck(fm, modulePath, 1.0)
await mModule.saveImages(fm, dir)
let df = new DateFormatter()
    df.dateFormat = 'dd.MM.yy, HH:mm'
let top = new Color("#6364F6")
let middle = new Color("#5748D4")
let bottom = new Color("#523BC4")
let bgGradient = new LinearGradient()
    bgGradient.locations = [0, 0.5, 1]
    bgGradient.colors = [top, middle, bottom]
let txtBGColor = Color.dynamic(new Color('#D5D7DC33'), new Color('#24242433'))
let cornerRadius = (roundProfileImages) ? 25 : 6
let nParameter = await args.notification
let wParameter = await args.widgetParameter
if (wParameter != null){
    userName = wParameter.split('@')[0]
    userInstance = wParameter.split('@')[1]
} else {
    favUser = favUsers[Math.floor(Math.random()*favUsers.length)]
    userName = favUser.split('@')[0]
    userInstance = favUser.split('@')[1]
};

let userID = await mModule.getUserID(userName, userInstance)
let res = await new Request(`https://${ userInstance }/api/v1/accounts/${ userID }/statuses`).loadJSON()
var body = res[0].content.replace(/<[^>]*>/g, '').replaceAll('&quot;','"').replace(/&#[\d+;]*/g, "'").replaceAll('&amp;', '&')
var reblogBody = (res[0].reblog == null) ? '' : res[0].reblog.content.replace(/<[^>]*>/g, '').replace(/&#[\d+;]*/g, "'")
var appName = (res[0].application == null) ? '' : (!res[0].application.name.toLowerCase().includes('via')) ? 'via '+ res[0].application.name : res[0].application.name


if (config.runsInNotification){
    QuickLook.present(nParameter.userInfo.url)
} else if (config.runsInWidget || config.runsInAccessoryWidget){
    switch (wSize){
     case "small": w = await createSmallWidget()
     break;
     case "medium": w = await createMediumWidget()
     break;
     case "large": w = await createLargeWidget()
     break;
     default: w = await createSmallWidget()
    }
    Script.setWidget(w)
} else if (config.runsInApp){
    await presentMenu()
};


if (userName === "simonbs") userName = "simon.bs"
if (!nKey.contains(`${ userName }_post_id`)) nKey.set(`${ userName }_post_id`, res[0].id)
    //console.warn(userName + ": " + nKey.get(`${ userName }_post_id`))
if (nKey.get(`${ userName }_post_id`) != res[0].id && CONFIGS.DEVICES[Device.model()].notifications) await mModule.notificationScheduler(df, res, body, reblogBody, nKey, userName)
//log(nKey.contains("mammothpost_id"))
//nKey.remove("simonbs_post_id"))


async function createSmallWidget(){
  let w = new ListWidget()
      w.setPadding(7, 7, 3, 7)
      w.refreshAfterDate = new Date(Date.now() + 1000 * 60 * CONFIGS.DEVICES[Device.model()].refreshInt)
      w.url = res[0].url
      w.backgroundGradient = bgGradient
  
  let mainStack = w.addStack()
      mainStack.layoutVertically()
      mainStack.backgroundImage = await mModule.getImage(fm, dir, "mastodon_10")
      mainStack.centerAlignContent()

  let hStack = mainStack.addStack()
      hStack.spacing = 4
  
  let wImage = hStack.addImage(await mModule.loadImage(res[0].account.avatar))
      wImage.imageSize = new Size(25, 25)
      wImage.cornerRadius = cornerRadius
  
  let hStack2 = hStack.addStack()
      hStack2.topAlignContent()
      hStack2.layoutVertically()
  
  let wTitle = hStack2.addText(res[0].account.display_name.replace(/(?<=:)\w+\D(?=:)/g, '').replace(/[:]/g, ""))
      wTitle.font = Font.boldRoundedSystemFont(12)
      wTitle.minimumScaleFactor = 0.7
      wTitle.lineLimit = 1
      //let applicationName = (res[0].application == null) ? "" : res[0].application.name
  let wSubtitle = hStack2.addText(await mModule.getDateTime(res[0].created_at) + " " + appName)
      wSubtitle.font = Font.thinRoundedSystemFont(7)
      wSubtitle.minimumScaleFactor = 0.6
      wSubtitle.lineLimit = 1
      
      w.addSpacer(2)
      
  if (!uCheck.needUpdate){
    if (res[0].reblog == null){
        wBody = mainStack.addText(body)
        wBody.url = res[0].url
    }else{
        wBody = mainStack.addText(reblogBody)
        wBody.url = res[0].reblog.url
    }
    wBody.font = Font.regularRoundedSystemFont(9)
  } else {
    updateInfo = mainStack.addText(`Version ${uCheck.uC.version} is Available\nRun Script in App to update`)
    updateInfo.font = new Font("Menlo-Bold", 12)
    updateInfo.textColor = Color.red()
    updateInfo.shadowColor = Color.black()
    updateInfo.shadowOffset = new Point(2, 5)
    updateInfo.shadowRadius = 4
    updateInfo.centerAlignText()
  }
  
      mainStack.addSpacer()
  
  let countStack = mainStack.addStack()
      countStack.centerAlignContent()
      
      replies = await mModule.getCounts(countStack, "bubble.left.and.bubble.right", res[0].replies_count, 12, 2)
      reblogs = await mModule.getCounts(countStack, "arrow.2.squarepath", res[0].reblogs_count, 12, null)
      stars = await mModule.getCounts(countStack, "star", res[0].favourites_count, 12, 2)
  if (res[0].edited_at != null) edited = await mModule.getCounts(countStack, "pencil", "", 12, 2)
  
  return w
};


async function createMediumWidget(){
  let w = new ListWidget()
      w.setPadding(7, 7, 1, 7)
      w.refreshAfterDate = new Date(Date.now() + 1000 * 60 * CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundGradient = bgGradient

      w.addSpacer(2)
  
  let headerStack = w.addStack()
      headerStack.url = res[0].account.url
      headerStack.spacing = 4
      //headerStack.backgroundColor = Color.green()
  
  let userImage = headerStack.addImage(await mModule.loadImage(res[0].account.avatar))
      userImage.imageSize = new Size(42, 42)
      userImage.cornerRadius = cornerRadius
  
  let userStack = headerStack.addStack()
      userStack.topAlignContent()
      userStack.layoutVertically()
      //userStack.backgroundColor = Color.red()
      userStack.spacing = -2
      
  let userDisplayNameStack = userStack.addStack()
      userDisplayNameStack.spacing = 3
      userDisplayNameStack.centerAlignContent()
      userDisplayNameStack.setPadding(-2, 0, -2, 0)
      //userDisplayNameStack.backgroundColor = Color.blue()
  
  let displayName = await mModule.emojCreator(res[0].account.display_name, userInstance, userDisplayNameStack)
      
  let userName = userStack.addText(await mModule.createUserName(res[0].account.url))
      userName.font = Font.lightRoundedSystemFont(12)
      userName.textOpacity = 0.7
  
  let created = userStack.addText(await mModule.getDateTime(res[0].created_at) + " " + appName)
      created.font = Font.thinRoundedSystemFont(8)
      created.textOpacity = 0.5
     
      headerStack.addSpacer()
     
  let headerImg = headerStack.addImage(await mModule.getImage(fm, dir, 'mastodon'))
      headerImg.imageSize = new Size(18, 18)
      headerImg.url = `https://${ userInstance }/`
      
      
  if (!uCheck.needUpdate){
    if (res[0].reblog == null){
        wBody = w.addText(body)
        wBody.url = res[0].url
    }else{
        wBody = w.addText(reblogBody)
        wBody.url = res[0].reblog.url
    }
    wBody.font = Font.caption1()
  } else {
    updateInfo = w.addText(`Version ${uCheck.uC.version} is Available\nRun Script in App to update`)
    updateInfo.font = new Font("Menlo-Bold", 12)
    updateInfo.textColor = Color.red()
    updateInfo.shadowColor = Color.black()
    updateInfo.shadowOffset = new Point(2, 5)
    updateInfo.shadowRadius = 4
    updateInfo.centerAlignText()
  }
  
      
      //.title3()
      //.subheadline()
      //.footnote()
      //.callout()
      //.body()
     //.regularRoundedSystemFont(10)
  
      w.addSpacer()
  
  let countStack = w.addStack()
      countStack.centerAlignContent()
      //countStack.backgroundColor = Color.green()
      
  let replies = await mModule.getCounts(countStack, "bubble.left.and.bubble.right", res[0].replies_count, 14)
  let reblogs = await mModule.getCounts(countStack, "arrow.2.squarepath", res[0].reblogs_count, 14)
  let stars = await mModule.getCounts(countStack, "star", res[0].favourites_count, 14)
   if (res[0].edited_at != null) edited = await mModule.getCounts(countStack, "pencil", "", 13)
      
  return w
};


async function createLargeWidget(){
  let w = new ListWidget()
      w.setPadding(10, 7, 1, 0)
      w.refreshAfterDate = new Date(Date.now() + 1000*60* CONFIGS.DEVICES[Device.model()].refreshInt)
      w.backgroundGradient = bgGradient
  
  let mainStack = w.addStack()
      //mainStack.backgroundColor=Color.blue()
      mainStack.spacing = 5
  
  let imgStack = mainStack.addStack()
      imgStack.layoutVertically()
      //imgStack.backgroundColor = Color.green()
      imgStack.backgroundImage = await mModule.drawLine(body.length)
     
  let userImage = imgStack.addImage(await mModule.loadImage(res[0].account.avatar))
      userImage.imageSize = new Size(45, 45)
      userImage.url = res[0].account.url
      userImage.cornerRadius = cornerRadius
      
      imgStack.addSpacer()
     
  let bodyStack = mainStack.addStack()
      bodyStack.layoutVertically()
      bodyStack.topAlignContent()
      //bodyStack.backgroundColor=Color.gray()
     
      mainStack.addSpacer()
      
  let headerStack = bodyStack.addStack()
      headerStack.spacing = 3
      //headerStack.backgroundColor=Color.red()
      headerStack.url = res[0].account.url
        
  let displayName = await mModule.emojCreator(res[0].account.display_name, userInstance, headerStack)
  
      headerStack.addSpacer()
  
  let mastodonImg = headerStack.addImage(await mModule.getImage(fm, dir, 'mastodon'))
      mastodonImg.imageSize = new Size(20, 20)
      mastodonImg.url = `https://${ userInstance }/`
      
  let userName = bodyStack.addText(await mModule.createUserName(res[0].account.url))
      userName.font = Font.regularRoundedSystemFont(11)
      userName.url = res[0].account.url
      userName.textOpacity = 0.7
      
      bodyStack.addSpacer(3)
      
      
  if (!uCheck.needUpdate){
    if (res[0].reblog == null){
        wBody = bodyStack.addText(body)
        wBody.url = res[0].url
    }else{
        wBody = bodyStack.addText(reblogBody)
        wBody.url = res[0].reblog.url
    }
    wBody.font = Font.caption1()
  } else {
    updateInfo = bodyStack.addText(`Version ${uCheck.uC.version} is Available\nRun Script in App to update`)
    updateInfo.font = new Font("Menlo-Bold", 12)
    updateInfo.textColor = Color.red()
    updateInfo.shadowColor = Color.black()
    updateInfo.shadowOffset = new Point(2, 5)
    updateInfo.shadowRadius = 4
    updateInfo.centerAlignText()
  }

      //.title3()
      //.subheadline()
      //.footnote()
      //.callout()
      //.body()
      //.regularRoundedSystemFont(12)
      
      w.addSpacer(2)
  
      bodyStack.addSpacer(3)
      
  let wSubtitle = bodyStack.addText(await mModule.getDateTime(res[0].created_at) + " " + appName)
      wSubtitle.font = Font.thinRoundedSystemFont(9)
      wSubtitle.textOpacity = 0.5
     
  if (res[0].media_attachments[0] != undefined && !res[0].media_attachments[0].url.includes(".mp4")){
      imgBody = bodyStack.addImage(await mModule.loadImage(res[0].media_attachments[0].url))
      imgBody.cornerRadius = 10
      imgBody.url = res[0].url
  }
      
      w.addSpacer()
      
  let countStack = w.addStack()
      countStack.topAlignContent()
      //countStack.backgroundColor = Color.red()

  let replies = await mModule.getCounts(countStack, "bubble.left.and.bubble.right", res[0].replies_count, 16) 
  let reblogs = await mModule.getCounts(countStack, "arrow.2.squarepath", res[0].reblogs_count, 16)
  let stars = await mModule.getCounts(countStack, "star", res[0].favourites_count, 16)
edited = (res[0].edited_at != null) ? await mModule.getCounts(countStack, "pencil", "", 14) : null
  if (res[0].edited_at != null) edited = await getCounts(countStack, "pencil", "", 14)
  
 return w
};


async function presentMenu(){
    a = new Alert()
    a.title = "Widget Size"
    a.message = res[0].account.display_name.replace(/(?<=:)\w+\D(?=:)/g, '').replace(/[:]/g, "")
    a.addAction("Small")
    a.addAction("Medium")
    a.addAction("Large")
    a.addCancelAction("Cancel")
    idx = await a.presentAlert()
    if (idx == 0){
        w = await createSmallWidget()
        await w.presentSmall()
    } else if (idx == 1){
        w = await createMediumWidget()
        await w.presentMedium()
    } else if (idx == 2){
        w = await createLargeWidget()
        await w.presentLarge()
   }
};


async function loadModule(){
   req = new Request('https://raw.githubusercontent.com/iamrbn/Mastodon-Widget/main/mastodonModule.js')
   moduleFile = await req.loadString()
   fm.writeString(modulePath, moduleFile)
   console.warn('loaded mastodonModul.js file from github')
};

//===============================
//===============================
//===============================
