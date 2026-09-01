# コンテンツスキーマ

課題データは `TaskTemplate`（`src/types/index.ts`）に準拠します。

- `id`: 一意な課題ID
- `mode`, `direction`: 競泳/習い事と、`establish`・`explore`・`transfer` の方向
- `title`, `summary`, `setup`, `instructions`, `participantCue`: 表示する課題文
- `domains`, `goals`, `observedTags`, `levels`: 検索・マッチング用の選択肢。`src/data/formOptions.ts` のレベル別選択肢を使う
- `primaryConstraint`, `fixedConditions`, `requiredEquipment`, `optionalEquipment`: Individual・Task・Environmentの制約
- `successCriteria`, `coachObservation`, `prescription`: 成立条件、観察可能な実施情報、実施メニュー。`prescription` は `activity`（やること）、`oneRep`（1回分）、`repetitions`（回数）、`recovery`（休み）を持つ
- `easier`, `harder`, `noEquipment`, `largeGroup`, `transferConnection`: 静的な変更案
- `variabilityLevel`, `presentationOrder`, `cueStyle`, `feedbackStyle`: 実施条件
- `evidenceIds`, `evidenceNote`, `reviewStatus`: 根拠と監修状態。初期データは `reviewStatus: "draft"`

課題の表示文は各課題で具体的に書き、距離・回数の対象が分かるようにします。IDの重複や、根拠にない効果の断定を避けます。競泳版は6局面×3レベル×3方向×2案の108件、習い事水泳版はレベルごとに12件、方向ごとに4件の36件を維持します。入力のレベルと局面・技能領域は必須一致です。
