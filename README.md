- 项目基于[AISubtitle](https://github.com/cgsvv/AISubtitle) 开发

# 新增

- [x] 自定义`Base Host`
- [x] 自定义`模型`
- [x] 自定义`prompt`

# 使用申明

该项目改为本地`直连`Api 地址，如果使用中转和反代，请检查跨域问题。

# 使用步骤

## 1、情况说明

#### a、自有 Api key 和 【本地环境】支持的

- 把下图 2 设置为: `sk-xxxxxxxx`
- 把下图 1 设置为: `https://api.openai.com`

#### b、有自建反代的

- 把下图 1 设置为你的地址: `https://xxxx.xxxxx.com`

#### c、中转的

- 把下图 2 设置为`中转`的 key: `xxxxxxxx`
- 把下图 1 设置为`中转`的地址: `https://xxxx.xxxxx.com`

<div>
<img src="./public/setting_1.png" />
</div>

## 2、推荐设置

如果你想翻译快点，可以把分页大小设置大点，然后把模型改为`16k`版本，如果你有`gpt-4`权限，可直接切换至`gpt-4`模型使用


***

- The project is developed based on [AISubtitle](https://github.com/cgsvv/AISubtitle)

# Additions

- [x] Customizable `Base Host`
- [x] Customizable `Model`
- [x] Customizable `Prompt`

# Usage Declaration

This project has been switched to a local `Direct Connect` API address. If using a proxy or reverse proxy, please check for cross-origin issues.

# Usage Steps

## 1. Situation Description

#### a. For those with their own Api key and support for 【Local Environment】:

- Set the setting in image 2 to: `sk-xxxxxxxx`
- Set the setting in image 1 to: `https://api.openai.com`

#### b. For those with their own reverse proxy:

- Set the setting in image 1 to your address: `https://xxxx.xxxxx.com`

#### c. For those using an intermediary:

- Set the setting in image 2 to the intermediary's key: `xxxxxxxx`
- Set the setting in image 1 to the intermediary's address: `https://xxxx.xxxxx.com`

<div>
<img src="./public/setting_1.png" />
</div>

## 2. Recommended Settings

To speed up translations, you can increase the pagination size and switch the model to the `16k` version. If you have access to `gpt-4`, you can directly switch to using the `gpt-4` model.
