# <img title="Mastodon Icon" src="/Images/mastodon.png" width="24"/> Mastodon-Widget
Script which shows Posts of your favorite users on Mastodon via [Scriptable-App](https://scriptable.app/)     

![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fiamrbn%2FMastodon-Widget%2Fmain%2FMastodon-Widget.json%3Ftoken%3DGHSAT0AAAAAACS44I5LXSHOYD2IPJHRP3MGZT5FCXQ&query=version&style=plastic&logo=mastodon&logoColor=5B45DA&logoSize=auto&label=Version&labelColor=white&color=5B45DA "Hi there 👋 I'm always up to date")

## Overview
<img title="Overview Available Widget Sizes" src="/Images/overviewWidgets.png" width="1000"/>

## Features

- Activate Push-Notifiactions (_Devices specific_)
- Set widget refresh interval (_Devices specific_)
- Clickable username, profileimage, and post itself
- Image preiview (_if available_) for the large widget
- Shows instance emoji in username if available (_medium & large widget_)

## Config

#### Script Parameter
``` Javascript
var CONFIGS = {
      DEVICES: {
       iPad: {
        notifications: false, //true = Allow Push-Notifications on specific device
        refreshInt: 60 //widget refresh interval in minutes
        },
       iPhone: {
        notifications: true,
        refreshInt: 30
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
```

#### Widget Parameter (_Optional_)
Select your favorite users via `favUsers` array and / or select it individual for every single widget via widget parameter.

### Selfupdate Function
The Script updates itself[^1]

### On the first run
It downloads a module and three images from this github repo and saves it in the "Mastodon-Widget" directory.    
<img title="mastodonModule example icon" src="Images/jsModule.png" width="50"/>  <img title="mastodon icon" src="Images/mastodon.png" width="42"/> <img title="mastodon icon with 10% opacity" src="Images/mastodon_10.png" width="42"/>

```
iCloud Drive/
├─ Scriptable/
│  ├─ Mastodon-Widget/
│  │  ├─ mastodon.png
│  │  ├─ mastodon_10.png
│  │  ├─ mastodonModule.js
```

---

<p align="center">
  <a href="https://reddit.com/user/iamrbn/">
    <img title="Follow Me On Reddit: @iamrbn" src="https://github.com/iamrbn/slack-status/blob/08d06ec886dcef950a8acbf4983940ad7fb8bed9/Images/Badges/reddit_black_iamrbn.png" width="125"/>
  </a>
  <a href="https://twitter.com/iamrbn_/">
    <img title="Follow Me On Twitter: @iamrbn_" src="https://github.com/iamrbn/slack-status/blob/ae62582b728c2e2ad8ea6a55cc7729cf71bfaeab/Images/Badges/twitter_black.png" width="130"/>
  </a>
  <a href="https://mastodon.social/@iamrbn">
    <img title="Follow Me On Mastodon: @iamrbn@mastodon.socail" src="https://github.com/iamrbn/slack-status/blob/1e67e1ea969b791a36ebb71142ec8719594e1e8d/Images/Badges/mastodon_black.png" width="163"/>
  </a>
</p>

<br>

[^1]:[Ground Function](https://github.com/mvan231/Scriptable#updater-mechanism-code-example "GitHub Repo") is written by the amazing [@mvan231](https://mastodon.social/@mvan231 "Mastodon")
