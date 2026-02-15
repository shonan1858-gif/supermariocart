# supermariocart (3D マリオカート8DX風 MVP)

Three.js + cannon-es (RaycastVehicle) + Vite + TypeScript で作るブラウザ向け3DカートレースのMVPです。

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## 操作

- W / ↑ : アクセル
- S / ↓ : ブレーキ / 後退
- A / ← , D / → : ステア
- Shift : ドリフト（チャージして離すとミニターボ）
- Space : アイテム使用
- R : リスポーン
- F1 : デバッグ表示 ON/OFF
- F2 : 物理ワイヤーフレーム ON/OFF（TODO: 描画本体）

## 現在の実装範囲

- RaycastVehicle 4輪で走行
- 三人称チェイスカメラ（lerp/slerp追従）
- 1台CPUの簡易waypoint追従
- ドリフトミニターボ 3段階（青/橙/桃の段階表現）
- AntiGravityゾーン侵入で重力方向を法線ベースに変更
- アイテム取得（1枠）と使用（コイン/バナナ/緑/赤/キノコ/スターの簡略）
- HUD（速度/ラップ/順位/アイテム/ドリフト段階/コイン/antiGravity/FPS）

## TODO（次段階）

- TrackをS字中心線＋厳密なラップ判定へ拡張
- AntiGravityの壁/天井メッシュと接地法線5点サンプルの本実装
- 赤甲羅ホーミング挙動とスター無敵挙動の可視化
- F2ワイヤーフレームデバッグ表示実装
