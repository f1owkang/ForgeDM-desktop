# ForgeDM 品牌图标源（brand-assets/）

占位品牌资产的生成源与产物（WP-D Task 1）。**正式 VI 到位后整体替换本目录与
`app/static/logos/{prod,dev}/` 下同名文件。**

## 内容

- `generate.py` —— 占位图标生成脚本（Pillow，纯几何螺母+F，无字体依赖）
- `forgedm-mark-*.png` —— 各尺寸 PNG 导出
- `icon-logo.ico` / `icon-logo-legacy.icns` —— 与应用内替换文件完全一致的副本

## 再生成

```bash
python3 generate.py .
```

## 替换映射

| 生成物 | 应用内位置 |
|---|---|
| `icon-logo.ico` | `app/static/logos/prod/`、`app/static/logos/dev/` |
| `icon-logo-legacy.icns` | 同上两处 |

> 构建引用点：`script/build.ts:190`（icns 仅 darwin）、`script/package.ts:86`。
> `app/static/logos/**/*.icon/` 与 `Assets.car` 为上游 Icon Composer 源，
> 不参与当前构建，未替换。
