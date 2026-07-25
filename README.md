# ほどく

一日の終わりに、音声ガイダンスとBGMで身体の緊張をほどくための個人用PWAです。

## 主な機能

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

## 推奨フォルダ構成

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

## ローカルでの確認方法

Finderから `index.html` を直接開くと、ブラウザの制限によりJSONを読み込めない場合があります。

ターミナルでこのプロジェクトのフォルダへ移動し、ローカルサーバーを起動してください。

```bash
python3 -m http.server 8000
```

Safariで次のURLを開きます。

```text
http://localhost:8000
```

終了するときは、ターミナルで `Control + C` を押します。

## GitHub Pagesへの公開

1. GitHubのリポジトリへ、このフォルダ構成のままアップロードします。
2. リポジトリの `Settings` を開きます。
3. `Pages` を開きます。
4. 公開するブランチとフォルダを指定します。
5. 発行されたURLをSafariで開きます。
6. iPhoneの共有メニューから「ホーム画面に追加」を選びます。

## 音声ファイルについて

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

## PWAキャッシュについて

Service Workerのキャッシュ名は、`service-worker.js` 内の次の値で管理します。

```javascript
const CACHE_NAME = "hodoku-v1";
```

HTML、CSS、JavaScript、JSON、音声などを更新した際に古い内容が残る場合は、次のようにバージョン番号を変更してください。

```javascript
const CACHE_NAME = "hodoku-v2";
```

## BGMクレジット

### 深夜のアンビエント

- 提供：Eryliaa
- URL：https://pixabay.com/users/eryliaa-50095874/
- 使用ファイル：`audio/bgm/eryliaa-gentle-rain-for-relaxation-and-sleep-337279.mp3`

### 静かな雨

- 提供：GigiDeLaRoMusic
- URL：https://pixabay.com/users/gigidelaromusic-51134264/
- 使用ファイル：`audio/bgm/gigidelaromusic-peaceful-light-ray-short-450966.mp3`

## ライセンスについて

BGMはPixabayから取得した素材を使用しています。

公開・配布前に、使用時点のPixabay Content Licenseと各素材ページの条件を確認してください。

クレジット表記が必須でない場合でも、制作者への敬意として本READMEに提供者情報を記載しています。

## 注意事項

- このアプリは医療行為、診断、治療を目的としたものではありません。
- 音声再生中は、端末やブラウザの状態によってWake Lockが解除される場合があります。
- WebアプリからiPhoneを強制的にロックすることはできません。
- 再生終了後はWake Lockを解除し、iPhone本体の自動ロック設定に従います。
