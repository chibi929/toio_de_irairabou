# toio_de_irairabou

このリポジトリは [この記事](https://zenn.dev/articles/161f08b885cb6d) で使用しているリポジトリです。

## Development environmnets

- PC: Mac OSX 11.2.3
- Node: v14.18.2
- yarn: 1.22.17 (npm: 8.3.0)

## Usage

- toio が準備できていること
- PS4のコントローラー(CUH-ZCT2) が USB で繋がっていること

```bash
$ git clone git@github.com:chibi929/toio_de_irairabou.git
$ cd toio_de_irairabou
$ yarn
$ yarn start

# 衝突検出(isCollisionDetected) が true のまま戻らなくなったら、
# 一度プログラムを停止し、再度 yarn start で起動させてください。
```

## 設定機能

- 衝突検出の閾値レベルの変更 (低いほうが敏感に反応する)
    - 方向キー(上): 閾値レベルを上げる
    - 方向キー(下): 閾値レベルを下げる
- 操作パターンの切り替え
    - L3: 左スティックモード
    - R3: 左右スティックモード

## 操作説明

- 左スティックモード
    - 左スティックで上下左右を操作します
- 左右スティックモード
    - 左スティックは左のタイヤを、右スティックは右のタイヤを操作します
