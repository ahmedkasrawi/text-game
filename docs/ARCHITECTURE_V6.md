# المعمارية وبنية البيانات وخطة الترحيل — «الظل التاه» (v6.0)

> مخرج **الخطوة 1** من [`PLAN.md`](../PLAN.md): توثيق هيكل المشروع الجديد، عقد الحالة (`v6 State Schema`)، وخطة الترحيل غير المدمرة من حفظ النسخة القديمة (`v5`).

---

## 1. الهيكل الجديد للملفات والمجلدات

```text
game/
├── index.html                  # غلاف التطبيق + تحميل السكربتات الكلاسيكي بالترتيب
├── PLAN.md                     # خارطة الطريق ذات الـ 10 خطوات
├── docs/
│   └── ARCHITECTURE_V6.md      # هذا المستند (المعمارية + عقد البيانات + الترحيل)
├── assets/                     # (جديد) كافة الأصول البصرية المنظمة والنظيفة
│   ├── ASSET_MANIFEST.md       # جرد الأصول ومواصفاتها
│   ├── scenes/                 # خلفيات المدن والمشاهد
│   ├── characters/             # بورتريهات الشخصيات (6–8 رئيسية + عابرة)
│   ├── items/
│   │   ├── weapons/{swords,axes,spears,bows}/
│   │   ├── armors/
│   │   ├── potions/
│   │   └── accessories/
│   └── ui/                     # الشعار، الخريطة المصغّرة، أختام الفصائل
├── css/
│   ├── theme.css               # متغيرات الألوان الداكنة (Obsidian / Gold / Crimson / Ash)
│   ├── layout.css              # شبكة الواجهة السينمائية (مسرح + لوحة متحدث + تجهيز)
│   └── components.css          # البطاقات، شجرة القصة، المواجهة التكتيكية، القوائم
├── js/
│   ├── v6/
│   │   └── schema.js           # (جديد في الخطوة 1) ثوابت v6، قالب الحالة، وجسر إرث v5
│   ├── state.js                # (حالياً v5 للتوافق — سيُرقّى في الخطوة 3)
│   ├── engine.js               # (سيُدمج مع محرك v6 + القتال التكتيكي في الخطوتين 3–4)
│   ├── storage.js              # (سيُرقّى في الخطوة 3/5 لدعم مفاتيح v6 وترحيل v5)
│   ├── audio.js                # المؤثرات الصوتية
│   ├── icons.js                # أيقونات SVG الاحتياطية
│   ├── ui.js                   # (سيُعاد بناؤه في الخطوة 6 للواجهة السينمائية)
│   └── data/
│       └── v6/                 # (جديد) ملفات بيانات المواجهات، الشخصيات، المدن، الفصول 1–3
├── متجر/                       # الأصول الأولية الـ 26 من المستخدم (مرجع قبل خطوة 2)
└── tests/
    ├── engine.test.js          # اختبارات المحرك الحالي v5
    ├── ui_smoke.test.js        # فحص سلامة index.html والـ DOM
    └── v6_schema.test.js       # (جديد في الخطوة 1) اختبارات عقد v6 وجسر v5
```

---

## 2. عقد الحالة الجديد (`V6 State Schema`) — المعرّف في `js/v6/schema.js`

تم تصميم قالب الحالة الجديدة ليحفظ كل أبعاد اللعبة التجارية دون تعارض مع أي متصفح أو قيود `localStorage`:

1. **`meta` و `timeline`:**
   - `schemaVersion: 6`، `gameTitle: 'الظل التاه'`، `difficulty: 'normal' | 'hard' | 'nightmare'`
   - `chapter: 1 | 2 | 3` *(طفولة 7–11، شباب 12–17، نضج 18–25)*
   - `age: 7..25`، `season: 1..4`، `turn: 1..92`، `locationId` (المدينة الحالية على الخريطة)
2. **`vitals` و `economy`:**
   - `hp`, `maxHp`, `stamina`, `maxStamina`, `gold`, `debt`, `debtDueTurn`, `reputation`, `suspicion`
   - `properties`: مصفوفة العقارات/الاستثمارات التي تدر دخلاً أو تتعرض لأزمات في الفصل الثالث
   - `retinueUpkeep`: تكاليف المرافقين والحرس/المرتزقة الموسمية في سن 18–25
3. **`stats` و `skills` و `scars`:**
   - **السمات (5):** `str`, `int`, `agi`, `cha`, `ins`
   - **المهارات (6):** `combat`, `stealth`, `trade`, `smithing`, `alchemy`, `politics`
   - **`scars` (الندوب الدائمة):** قائمة معرّفات ندوب تؤثر على السمات والحوارات (`scar_eye`, `scar_leg`, `scar_burn`, `scar_brand`, `scar_tremor`)
4. **`factions` (القوى البشرية الأربع + الانتماء):**
   - `legion` (فيلق الإمارات)، `shadow` (نقابة الظل)، `merchants` (اتحاد التجار والمصارف)، `church` (النظام المقدس/محاكم التفتيش)
   - `joinedFaction`: `'none' | 'legion' | 'shadow' | 'merchants' | 'church' | 'freelance'`
5. **`loadout` (شاشة التجهيز البصرية):**
   - `weaponId` (بنوع سلاح محدد: `sword | axe | spear | bow`)
   - `armorId`, `accessoryId`, `potionSlots: [null, null, null]`
   - `ownedWeapons`, `ownedArmors`, `ownedAccessories`, `potionsInventory`
6. **`characters` (طاقم الـ 6–8 شخصيات + العابرون):**
   - `roster[charId] = { met, alive, loyalty, trust, fear, relationshipStage, romance, betrayed, questStage }`
   - `companionId`: الرفيق النشط المرافق للاعب في التنقل والقتال
   - `encounteredTransient`: سجل الشخصيات الثانوية العابرة التي صادفها اللاعب
7. **`progression` و `achievements` (الشجرة الزمنية + الإنجازات الأسطورية):**
   - `flags`: أعلام الأحداث المترابطة عبر الأعمار 7–25
   - `pendingRipples`: طابور التداعيات بعيدة المدى
   - `timelineNodes`: عقد القرارات لعرض **شجرة الخط الزمني** في نهاية الرحلة
   - `endingId` و `prestigeProgress`: تتبع سلاسل الإنجازات الأسطورية الصعبة مثل *«الأقوى»* و*«ملك البشر»*

---

## 3. خطة الترحيل وحماية الحفظ القديم (Zero-Loss Migration Plan)

لتفادي كسر أو مسح حفظ اللاعبين في النسخة السابقة («سليل السندان» `v5`):

1. **فصل مفاتيح التخزين تماماً (`Namespace Isolation`):**
   - مفاتيح النسخة القديمة تبقى مقروءة ولا تُحذف:
     - `salil_anvil_autosave_v1`
     - `salil_anvil_slots_v1`
     - `salil_anvil_endings_v1`
     - `salil_anvil_settings_v1`
   - مفاتيح «الظل التاه» الجديدة (`v6`) تستخدم نطاقاً مستقلاً:
     - `alzel_altaeh_autosave_v6`
     - `alzel_altaeh_slots_v6`
     - `alzel_altaeh_profile_v6` *(النهايات + الإنجازات الأسطورية + إحصاءات التختيم)*
     - `alzel_altaeh_settings_v6`
2. **عدم الخلط بين حالات القصة القديمة والجديدة:**
   - بما أن v6 تبدّل العالم والأعمار (7–25) والأعراق والقتال كلياً، **لا يتم تحميل حفظ رحلة `v5` كرحلة جارية في `v6`** لأن سياق الأحداث مختلف جذرياً.
3. **جسر «إرث المخضرمين» (`readLegacyV5Bridge`):**
   - يقرأ المحرك الجديد مفتاحي `salil_anvil_endings_v1` و`salil_anvil_settings_v1` **للقراءة فقط**؛ فإذا وُجدت نهايات مفتوحة أو إعدادات صوت/سرعة نص من النسخة السابقة:
     - يرث اللاعب تلقائياً تفضيلات الصوت وسرعة النص.
     - يحصل حسابه في `v6` على شارة **«عابر العوالم القديم (إرث v5)»** + مكافأة إرث اختيارية في رحلته الأولى دون المساس ببيانات `v5` الأصلية.
