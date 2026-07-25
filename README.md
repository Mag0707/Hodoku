# ほどく / HODOKU

## 日本語

一日の終わりに、音声ガイダンスとBGMで身体の緊張をほどくための個人用PWAです。

### 主な機能

- 3分・7分・12分のガイダンスコース
- OnyxによるAI生成音声
- 1文ごとの音声再生
- JSONで管理する文間の待機時間
- コースごとのランダムなねぎらいメッセージ
- BGM選択と音量調整
- ガイダンス終了後のBGM継続
- 再生中の画面ロック防止
- 再生終了後はiPhone本体の自動ロック設定に準拠
- PWA対応
- オフライン利用対応

### 推奨フォルダ構成

```text
hodoku/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── audio/
    ├── bgm/
    │   ├── gigidelaromusic-peaceful-light-ray-short-450966.mp3
    │   └── eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3
    └── guidance/
        ├── 03min/
        ├── 07min/
        ├── 12min/
        ├── messages/
        └── manifests/
            ├── 03min.json
            ├── 07min.json
            ├── 12min.json
            └── messages.json
```

### GitHub Pagesへの公開

1. GitHubのリポジトリへ、このフォルダ構成のままアップロードします。
2. リポジトリの `Settings` を開きます。
3. `Pages` を開きます。
4. 公開するブランチとフォルダを指定します。
5. 発行されたURLをSafariで開きます。
6. iPhoneの共有メニューから「ホーム画面に追加」を選びます。

### 音声ファイルについて

ガイダンス音声はAIによって生成されています。

音声ファイルは次のフォルダへ配置します。

```text
audio/guidance/
```

各コースの再生順と文間の待機時間は、次のJSONファイルで管理します。

```text
audio/guidance/manifests/03min.json
audio/guidance/manifests/07min.json
audio/guidance/manifests/12min.json
audio/guidance/manifests/messages.json
```

`wait_ms` の値を変更すると、MP3を再生成せずに文間の待機時間を調整できます。

例：

```json
{
  "file": "../03min/001.mp3",
  "text": "楽な姿勢になってください。",
  "wait_ms": 3000
}
```

`3000` は3秒です。

### PWAキャッシュについて

Service Workerのキャッシュ名は、`service-worker.js` 内の次の値で管理します。

```javascript
const CACHE_NAME = "hodoku-v5";
```

HTML、CSS、JavaScript、JSON、音声などを更新した際に古い内容が残る場合は、次のようにバージョン番号を変更してください。

```javascript
const CACHE_NAME = "hodoku-v6";
```

### BGMクレジット

#### 深夜のアンビエント

- 提供：Eryliaa
- URL：https://pixabay.com/users/eryliaa-50095874/
- 使用ファイル：`audio/bgm/gigidelaromusic-peaceful-light-ray-short-450966.mp3`

#### 静かな雨

- 提供：GigiDeLaRoMusic
- URL：https://pixabay.com/users/gigidelaromusic-51134264/
- 使用ファイル：`audio/bgm/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3`

### フォントクレジット

#### Zen Maru Gothic

- 提供：Yoshimichi Ohira
- URL：https://fonts.google.com/specimen/Zen+Maru+Gothic
- ライセンス：SIL Open Font License 1.1
- 使用箇所：アプリ内のタイトル、ガイダンスメッセージ、設定、ボタンなどの表示文字

### ライセンスについて

BGMはPixabayから取得した素材を使用しています。Zen Maru GothicはSIL Open Font License 1.1に基づいて使用しています。

公開・配布前に、使用時点のPixabay Content Licenseと各素材ページの条件を確認してください。

クレジット表記が必須でない場合でも、制作者への敬意として本READMEに提供者情報を記載しています。

### 注意事項

- このアプリは医療行為、診断、治療を目的としたものではありません。
- 音声再生中は、端末やブラウザの状態によってWake Lockが解除される場合があります。
- WebアプリからiPhoneを強制的にロックすることはできません。
- 再生終了後はWake Lockを解除し、iPhone本体の自動ロック設定に従います。

---

## English

HODOKU is a personal progressive web app designed to help release physical tension at the end of the day through guided audio and background music.

### Main features

- 3-minute, 7-minute, and 12-minute guided sessions
- AI-generated narration using the Onyx voice
- Sentence-by-sentence audio playback
- Configurable pauses between sentences using JSON
- Random supportive messages for each course
- Background music selection and volume controls
- Optional background music after the guided session
- Screen wake lock while audio is playing
- Automatic return to the iPhone's system auto-lock behavior after playback
- PWA support
- Offline support

### Recommended folder structure

```text
hodoku/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── audio/
    ├── bgm/
    │   ├── gigidelaromusic-peaceful-light-ray-short-450966.mp3
    │   └── eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3
    └── guidance/
        ├── 03min/
        ├── 07min/
        ├── 12min/
        ├── messages/
        └── manifests/
            ├── 03min.json
            ├── 07min.json
            ├── 12min.json
            └── messages.json
```

### Publishing with GitHub Pages

1. Upload the files to a GitHub repository without changing the folder structure.
2. Open the repository's `Settings`.
3. Open `Pages`.
4. Select the branch and folder to publish.
5. Open the generated URL in Safari.
6. On iPhone, use the Share menu and choose “Add to Home Screen.”

### Guidance audio

The guided narration is generated using AI.

Place the audio files in:

```text
audio/guidance/
```

Playback order and pause duration are managed by these JSON files:

```text
audio/guidance/manifests/03min.json
audio/guidance/manifests/07min.json
audio/guidance/manifests/12min.json
audio/guidance/manifests/messages.json
```

You can adjust the pause after each sentence by changing `wait_ms` without regenerating the MP3 files.

Example:

```json
{
  "file": "../03min/001.mp3",
  "text": "楽な姿勢になってください。",
  "wait_ms": 3000
}
```

`3000` means three seconds.

### PWA cache

The Service Worker cache name is defined in `service-worker.js`:

```javascript
const CACHE_NAME = "hodoku-v5";
```

After updating HTML, CSS, JavaScript, JSON, or audio files, change the version number if an older cached version remains active:

```javascript
const CACHE_NAME = "hodoku-v6";
```

### Background music credits

#### Midnight ambient

- Creator: Eryliaa
- URL: https://pixabay.com/users/eryliaa-50095874/
- File used: `audio/bgm/gigidelaromusic-peaceful-light-ray-short-450966.mp3`

#### Quiet rain

- Creator: GigiDeLaRoMusic
- URL: https://pixabay.com/users/gigidelaromusic-51134264/
- File used: `audio/bgm/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3`

### Font credit

#### Zen Maru Gothic

- Creator: Yoshimichi Ohira
- URL: https://fonts.google.com/specimen/Zen+Maru+Gothic
- License: SIL Open Font License 1.1
- Used for: Titles, guidance messages, settings, buttons, and other interface text

### Licensing

The background music was obtained from Pixabay. Zen Maru Gothic is used under the SIL Open Font License 1.1.

Before publishing or redistributing the app, review the current Pixabay Content License and the conditions shown on each asset page.

Creator information is included in this README as a courtesy, even where attribution is not required.

### Notes

- This app is not intended to provide medical treatment, diagnosis, or therapy.
- Screen wake lock may be released depending on the device, browser, or operating system state.
- A web app cannot forcibly lock an iPhone.
- After playback ends, the app releases the wake lock and follows the iPhone's system auto-lock setting.
