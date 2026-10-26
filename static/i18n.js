/* NuclearStegNet bilingual (EN/AR) helper. Usage: data-i18n="key" (innerHTML), data-i18n-title, t(key, params). */
(function () {
const D = {
en: {
 'app.sub':'Image Steganalysis for Robotic Telemetry · SRM + SE-Attention Simulator',
 'nav.home':'Home','nav.analyze':'Analyze','nav.mission':'Mission','nav.tour':'Tour','lang.btn':'عربي',
 'st.connecting':'CONNECTING','st.online':'ONLINE','st.offline':'OFFLINE',
 /* analyze page */
 'an.banner':'Research simulator: the detector uses fixed SRM filters with <b>untrained, fixed weights</b>. Balanced accuracy / TPR / FPR / ROC are <b>simulated reference benchmarks</b>, not measured results.',
 'an.upload':'1 · Telemetry Frame Upload','an.optical':'Optical','an.thermal':'Thermal / IR',
 'an.drop':'Drop image here or click to browse','an.config':'2 · Configuration','an.alg':'Embedding algorithm',
 'an.payload':'Payload (bpp)','an.domain':'Evaluation domain','an.matched':'Matched — optical (BOSSbase)','an.cross':'Cross-sensor — thermal (HIT-UAV)',
 'an.run':'Run Analysis','an.running':'Analyzing…','an.verdict':'3 · Verdict','an.conf':'Confidence',
 'an.metrics':'Metrics','an.metricsNote':'(Bal.Acc/TPR/FPR = simulated reference)','an.orig':'Original (grayscale input)','an.res':'SE-weighted SRM residual |R|',
 'an.roc':'ROC Curve','an.se':'SE Channel Attention per SRM Filter','an.defense':'4 · Defense-in-Depth Monitor',
 'an.balacc':'Balanced Acc','an.simref':'simulated ref.','an.coverStego':'cover vs sim. stego','an.chance':'Chance','an.op':'Operating point','an.seW':'SE weight',
 'an.aucSim':'AUC = {auc} (simulated)','an.err':'Error: {m}','an.layer':'LAYER {n}','an.noAnalysis':'no analysis yet','an.profiling':'session profiling',
 'v.Stego':'STEGO','v.Cover':'COVER',
 'layer.L1':'AES-256-GCM Link','layer.L2':'Edge Anomaly (Jetson Xavier)','layer.L3':'Server Steganalysis','layer.L4':'Behavioral Profiling',
 'ls.SECURE':'SECURE','ls.DEGRADED':'DEGRADED','ls.NOMINAL':'NOMINAL','ls.ELEVATED':'ELEVATED','ls.ALERT':'ALERT','ls.STEGO DETECTED':'STEGO DETECTED','ls.CLEAR':'CLEAR','ls.IDLE':'IDLE','ls.MONITORING':'MONITORING',
 'sev.INFO':'INFO','sev.WARN':'WARN','sev.CRITICAL':'CRITICAL',
 'ev.l1':'AES-256-GCM packet {b}B tag={tag}.. verified; tamper rejected={tr} ({us}µs)','ev.l1nocrypto':'cryptography not installed — AES-GCM check skipped',
 'ev.l2':'Jetson Xavier edge AD: latency={lat}ms gpu={temp}°C anomaly={an}','ev.l3idle':'Server steganalysis idle; last verdict={v}',
 'ev.l3verdict':'Steganalysis verdict={v} P(stego)={p} [{alg} @ {pay} bpp, {dom}]',
 'ev.l4a':'Operator RX-07 command cadence deviates 2.3σ from profile','ev.l4b':'Unusual image upload volume from telemetry node N3','ev.l4c':'Off-shift teleoperation session detected',
 'ev.l4crit':'Behavioral profile: exfiltration-like pattern (large high-entropy frames)','ev.l4ok':'Behavioral baseline nominal ({n} sessions profiled)',
 'ev.mframe':'Mission frame {robot} @{zone} ({sensor}): {v} score={s}',
 /* mission */
 'm.title':'NuclearStegNet · Mission','m.sub':'Multi-robot inspection patrol · per-frame 4-layer telemetry check',
 'm.banner':'Frames are procedurally generated per robot type. "Test samples" are labelled synthetic positives (random ±1 changes in textured regions). Detector TPR/FPR are <b>measured on simulated frames</b> only:',
 'm.calib':'overall TPR {tpr}% · FPR {fpr}% — {pt} (change rate {rate}; {n} clean baseline frames per type/sensor)','m.calibType':'{k}: TPR {tpr}% / FPR {fpr}%','m.unavail':'unavailable','m.loading':'loading…',
 'm.map':'Facility map','m.ground':'🚙 Ground','m.aerial':'🚁 Drone','m.marine':'🚤 Marine','m.all':'All 3','m.pause':'Pause','m.start':'Start','m.speed':'Speed','m.manual':'Manual (arrows)','m.control':'Control',
 'm.lgAerial':'Drone: cyan circular downward footprint','m.lgGround':'Ground: green rotating LiDAR sweep','m.lgMarine':'Marine: blue sonar rings (water only)',
 'm.lgTargets':'☢ radiation source · 🔥 hot spot · 💧 leak · ⚠ anomaly — a target pulses in the colour of the robot that detects it','m.lgRed':'robot turns red = test sample detected in its frame',
 'm.feed':'Live feed','m.frame':'Frame','m.resmap':'SRM residual map','m.sendTest':'Send test sample','m.sendClean':'Send clean frame','m.sentFrom':'Sent from the robot selected in "Control".',
 'm.autoTest':'Auto-test, probability','m.rate':'Change rate','m.robot':'Robot','m.frames':'frames','m.alerts':'alerts','m.tptests':'TP/tests','m.fpclean':'FP/clean','m.targets':'targets',
 'm.chart':'Detector confidence (P test-sample)','m.log':'Event log (frames · target detections)',
 'r.ground':'Ground rover','r.aerial':'Aerial drone','r.marine':'Marine USV','rs.ground':'ground','rs.aerial':'aerial','rs.marine':'marine',
 'tg.rad':'Radiation source','tg.hot':'Hot spot','tg.leak':'Coolant leak','tg.anom':'Structural anomaly','tg.roofhot':'Roof hot spot','tg.intakeleak':'Intake leak','tg.debris':'Debris at intake',
 'room.reactor':'Reactor Hall','room.pump':'Pump Room','room.control':'Control','room.storage':'Storage','room.waste':'Waste Vault','room.lab':'Lab / Sensors','room.canal':'Cooling-water intake canal (sea intake)','room.intake':'intake',
 'z.reactor_hall':'reactor hall','z.pump_room':'pump room','z.control':'control','z.storage':'storage','z.waste_vault':'waste vault','z.corridor':'corridor','z.water_intake':'water intake',
 's.optical':'optical','s.thermal':'thermal','s.sonar':'sonar',
 'ms.idle':'idle','ms.patrolling':'patrolling','ms.manual':'manual drive','ms.scanning':'scanning target {id} ({label})','ms.capturing':'capturing {sensor} frame',
 'ms.transmitting':'transmitting encrypted (AES-256-GCM)','ms.flagged':'⚠ frame flagged — test sample detected','ms.clean':'frame verified clean','ms.linkerr':'link error',
 'mv.detected':'TEST SAMPLE DETECTED','mv.clean':'CLEAN','m.test':'TEST','m.cleanLbl':'clean','m.ctl':'◆ control','m.alt':'ALT {a}m',
 'ml.detected':'{robot} detected {kind} <b>{id}</b> — {label} @ ({x},{y})','ml.fail':'{robot}: request failed: {m}',
 'ml.meta':'conf={c} score={s} thr={thr} label={lbl} {ms}ms','ml.layers':'L1 AES-GCM {l1} tag={tag} · L2 edge {l2} {l2s} · L3 SRM {l3} {l3s} · L4 rate {l4} {l4s}/s · {ms}ms','ok':'OK','fail':'FAIL',
 /* tour */
 'tour.next':'Next','tour.back':'Back','tour.skip':'Skip','tour.done':'Finish','tour.step':'Step {i} of {n}',
 'tour.1t':'Facility map','tour.1':'A top-down map of a nuclear facility: rooms, corridors, hot zones and a cooling-water canal. Robots patrol here and their scan footprints cover the targets (☢ 🔥 💧 ⚠).',
 'tour.2t':'Choose robots','tour.2':'Switch between the ground rover, the aerial drone and the marine USV, or run all three. Pause, change the speed, or drive the selected robot manually with the arrow keys.',
 'tour.3t':'What each robot is doing','tour.3':'Each robot shows a live status line: patrolling, scanning a target, capturing a frame, or transmitting it encrypted.',
 'tour.4t':'Legend','tour.4':'Each robot has its own scan colour and shape. A target pulses in the colour of the robot that found it; a robot turns red when its frame is flagged.',
 'tour.5t':'Live feed','tour.5':'The latest frame (camera, thermal or sonar) next to its SRM residual map. High-frequency traces of hidden-data embedding show up in the residual map.',
 'tour.6t':'Test samples & counters','tour.6':'Send a labelled synthetic test sample (or a clean frame) to see whether the detector catches it. The table counts frames, alerts, true and false positives per robot.',
 'tour.7t':'Confidence chart','tour.7':'Detector confidence over time, one line per robot. Purple points are test samples.',
 'tour.8t':'Event log','tour.8':'Every frame passes 4 layers: AES-256-GCM, edge anomaly, SRM steganalysis and behaviour check. Target detections are logged here too.',
 /* intro */
 'i.kicker':'Master\'s thesis demo · Securing inspection-robot telemetry','i.h1':'Detecting hidden data in robot telemetry images',
 'i.lead':'NuclearStegNet is a teaching simulator for <b>steganalysis</b> — the detection of data hidden inside images. Inspection robots in nuclear facilities stream camera, thermal and sonar frames to an operations centre. A compromised robot or insider could hide information inside these frames (steganography) to leak it out unnoticed. This project shows how such frames can be checked, layer by layer.',
 'i.start':'▶ Start Mission Simulation','i.analyze':'🔬 Analyze an Image',
 'i.probT':'The problem','i.prob':'Telemetry images look normal to a human, yet tiny ±1 pixel changes can carry a hidden payload. Encryption protects the link, but it does not tell you whether the image content itself was manipulated before encryption. Steganalysis looks at statistical noise residuals to find these traces.',
 'i.simT':'What happens in the simulation','i.sim':'Three robots patrol a simulated facility. Every 2–3 seconds each one captures a synthetic frame and sends it to the server. Optionally, a frame is turned into a <i>labelled test sample</i> (random ±1 changes in textured regions). The server then runs the frame through four defence layers and returns a verdict.',
 'i.seeT':'What you will see','i.pipeT':'Detection pipeline','i.doT':'What you can do','i.honestT':'Honest note',
 'i.honest':'All TPR/FPR values on the Mission page are <b>measured on simulated frames</b> produced by this program, not on real facility data. The image analysis page uses fixed, untrained weights and <b>simulated reference</b> benchmark values. This is a teaching tool, not a certified security product.',
 'i.see1':'<b>Facility map</b> — rooms, corridors, hot zones and a cooling-water canal.',
 'i.see2':'<b>3 robots</b> — ground rover (<span style="color:#22c55e">green LiDAR</span>), aerial drone (<span style="color:#22d3ee">cyan footprint</span>), marine USV (<span style="color:#3b82f6">blue sonar</span>).',
 'i.see3':'<b>Targets</b> — ☢ radiation, 🔥 hot spots, 💧 leaks, ⚠ anomalies that pulse when scanned.',
 'i.see4':'<b>Live feed & residual map</b> — the frame and its high-frequency SRM residual.',
 'i.see5':'<b>4 defence layers</b> — per-frame results in the log, with red alerts.',
 'i.see6':'<b>Charts & counters</b> — confidence over time, alerts, true/false positives per robot.',
 'i.do1':'<b>Send test samples</b> and check whether the detector catches them.','i.do2':'<b>Compare robots</b> — the detector is harder or easier depending on the sensor.',
 'i.do3':'<b>Analyze your own image</b> — upload a frame and inspect the residual map, SE attention and ROC.','i.do4':'<b>Read the metrics</b> — measured TPR/FPR per robot type, and the limitations behind them.',
 'p.robot':'Robot frame','p.robotS':'camera / thermal / sonar','p.aes':'AES-256-GCM','p.aesS':'encrypt + integrity tag','p.edge':'Edge anomaly','p.edgeS':'fast on-board check',
 'p.steg':'Steganalysis','p.stegS':'SRM residuals + SE','p.beh':'Behaviour','p.behS':'rate / size profile',
 'm.autoClear':"Auto-clear flagged frames",
 'm.clear':"🧹 Clear",
 'm.cleared':"cleared",
 'm.clearRate':"cleared and re-verified / clear attempts (success rate)",
 'm.calibClear':"Clear (sanitize) success {ok}% — {per}",
 'm.calibClearType':"{k}: {ok}% of {n}, PSNR {psnr} dB, LSB BER {ber}; clean-frame PSNR if wrongly cleared {cpsnr} dB",
 'ms.clearing':"clearing hidden data…",
 'ms.cleared':"frame cleared — re-scan CLEAN",
 'ms.clearFail':"clearing failed — frame quarantined",
 'ms.awaitClear':"⚠ flagged — waiting for manual clear",
 'mv.clearing':"CLEARING…",
 'mv.cleared':"CLEARED → CLEAN",
 'mv.clearFail':"CLEAR FAILED",
 'ml.clearOk':"sanitized & re-verified: CLEAN",
 'ml.clearFail':"sanitization did not pass re-verification",
 'ml.clearMeta':"PSNR={psnr}dB SSIM={ssim} strength={a} LSB-BER={ber} ({ms}ms)",
 'ml.rescan':"re-scan score={s} < thr={thr}",
 'ev.mrescan':"Re-scan after clearing {robot} @{zone} ({sensor}): {v} score={s}",
 'ev.sanitize':"Sanitizer: frame {id} cleared={ok} strength={a} PSNR={psnr}dB",
 'ev.sanitizeUp':"Sanitizer (upload): {v0} → {v1}, strength={a}, PSNR={psnr}dB",
 'tour.9t':"Detect and clear",
 'tour.9':"When a frame is flagged, the sanitizer smooths the textured regions and re-quantizes them. This randomizes about half of their least-significant bits, so the hidden payload is destroyed. The frame is then re-checked by all 4 layers. Auto-clear is on by default; turn it off to clear frames manually with this button.",
 'an.clearBtn':"🧹 Clear hidden data",
 'an.clearing':"Clearing…",
 'an.clearT':"Detect & clear — before / after",
 'an.before':"Before (input)",
 'an.after':"After (cleaned)",
 'an.download':"⬇ Download cleaned image",
 'an.clearRes':"{v0} (score {s0}) → {v1} (score {s1}) · PSNR {psnr} dB · SSIM {ssim} · strength {a} · LSB-BER {ber}",
 'an.clearNote':"Detector used: {d}. On real images this is a heuristic: a score under the threshold does not prove the payload is gone.",
 'an.notNeeded':"Image already scores below the threshold — nothing changed.",
 'an.resBefore':"Residual before",
 'an.resAfter':"Residual after",
 'i.do5':"<b>Detect and clear</b> — flagged frames are sanitized automatically or with one click, then re-verified by all 4 layers.",
 'i.footer':'Academic research demo — hidden-data detection only.'
},
ar: {
 'app.sub':'تحليل إخفاء البيانات في صور قياسات الروبوتات · محاكي SRM مع انتباه SE',
 'nav.home':'الرئيسية','nav.analyze':'تحليل صورة','nav.mission':'المهمة','nav.tour':'جولة إرشادية','lang.btn':'EN',
 'st.connecting':'جارٍ الاتصال','st.online':'متصل','st.offline':'غير متصل',
 'an.banner':'محاكي بحثي: يستخدم الكاشف مرشحات SRM ثابتة <b>بأوزان ثابتة غير مُدرَّبة</b>. قيم الدقة المتوازنة ومعدل الكشف الصحيح (TPR) ومعدل الإنذار الكاذب (FPR) ومنحنى ROC هي <b>قيم مرجعية محاكاة</b> وليست نتائج مقيسة.',
 'an.upload':'١ · رفع إطار القياس','an.optical':'بصري','an.thermal':'حراري / تحت الحمراء',
 'an.drop':'اسحب الصورة هنا أو انقر للاختيار','an.config':'٢ · الإعدادات','an.alg':'خوارزمية الإخفاء',
 'an.payload':'الحمولة (بت/بكسل)','an.domain':'مجال التقييم','an.matched':'متطابق — بصري (BOSSbase)','an.cross':'عبر المستشعرات — حراري (HIT-UAV)',
 'an.run':'تشغيل التحليل','an.running':'جارٍ التحليل…','an.verdict':'٣ · الحكم','an.conf':'درجة الثقة',
 'an.metrics':'المقاييس','an.metricsNote':'(الدقة المتوازنة/TPR/FPR = قيم مرجعية محاكاة)','an.orig':'الأصل (تدرج رمادي)','an.res':'بواقي SRM الموزونة بـ SE |R|',
 'an.roc':'منحنى ROC','an.se':'انتباه قنوات SE لكل مرشح SRM','an.defense':'٤ · مراقبة الدفاع متعدد الطبقات',
 'an.balacc':'الدقة المتوازنة','an.simref':'مرجع محاكى','an.coverStego':'الغطاء مقابل الإخفاء المحاكى','an.chance':'الصدفة','an.op':'نقطة التشغيل','an.seW':'وزن SE',
 'an.aucSim':'AUC = {auc} (محاكاة)','an.err':'خطأ: {m}','an.layer':'الطبقة {n}','an.noAnalysis':'لا يوجد تحليل بعد','an.profiling':'تحليل سلوك الجلسات',
 'v.Stego':'يحتوي بيانات مخفية','v.Cover':'سليم',
 'layer.L1':'رابط AES-256-GCM','layer.L2':'كشف الشذوذ على الحافة (Jetson Xavier)','layer.L3':'تحليل الإخفاء على الخادم','layer.L4':'التحليل السلوكي',
 'ls.SECURE':'آمن','ls.DEGRADED':'متدهور','ls.NOMINAL':'طبيعي','ls.ELEVATED':'مرتفع','ls.ALERT':'إنذار','ls.STEGO DETECTED':'تم كشف إخفاء','ls.CLEAR':'سليم','ls.IDLE':'خامل','ls.MONITORING':'مراقبة',
 'sev.INFO':'معلومة','sev.WARN':'تحذير','sev.CRITICAL':'حرج',
 'ev.l1':'حزمة AES-256-GCM بحجم {b} بايت، الوسم={tag}.. تم التحقق؛ رفض التلاعب={tr} ({us} ميكروثانية)','ev.l1nocrypto':'مكتبة cryptography غير مثبتة — تم تخطي فحص AES-GCM',
 'ev.l2':'كشف الشذوذ على الحافة: زمن الاستجابة={lat} مللي ثانية، حرارة المعالج={temp}°م، الشذوذ={an}','ev.l3idle':'تحليل الإخفاء على الخادم خامل؛ آخر حكم={v}',
 'ev.l3verdict':'حكم تحليل الإخفاء={v} احتمال الإخفاء={p} [{alg} @ {pay} بت/بكسل، {dom}]',
 'ev.l4a':'إيقاع أوامر المشغّل RX-07 ينحرف بمقدار 2.3σ عن ملفه المعتاد','ev.l4b':'حجم رفع صور غير معتاد من عقدة القياس N3','ev.l4c':'تم رصد جلسة تشغيل عن بُعد خارج ساعات العمل',
 'ev.l4crit':'الملف السلوكي: نمط يشبه تسريب البيانات (إطارات كبيرة عالية الإنتروبيا)','ev.l4ok':'خط الأساس السلوكي طبيعي (تم تحليل {n} جلسة)',
 'ev.mframe':'إطار مهمة {robot} @{zone} ({sensor}): {v} الدرجة={s}',
 'm.title':'NuclearStegNet · المهمة','m.sub':'دورية تفتيش متعددة الروبوتات · فحص كل إطار عبر ٤ طبقات',
 'm.banner':'تُولَّد الإطارات إجرائيًا حسب نوع الروبوت. "عينات الاختبار" هي عينات إيجابية اصطناعية معلَّمة (تغييرات عشوائية ±1 في المناطق ذات النسيج). قيم TPR/FPR للكاشف <b>مقيسة على إطارات محاكاة</b> فقط:',
 'm.calib':'الإجمالي TPR {tpr}% · FPR {fpr}% — {pt} (معدل التغيير {rate}؛ {n} إطارًا سليمًا كخط أساس لكل نوع/مستشعر)','m.calibType':'{k}: TPR {tpr}% / FPR {fpr}%','m.unavail':'غير متاح','m.loading':'جارٍ التحميل…',
 'm.map':'خريطة المنشأة','m.ground':'🚙 أرضي','m.aerial':'🚁 طائرة مسيّرة','m.marine':'🚤 بحري','m.all':'الثلاثة معًا','m.pause':'إيقاف مؤقت','m.start':'تشغيل','m.speed':'السرعة','m.manual':'تحكم يدوي (الأسهم)','m.control':'التحكم',
 'm.lgAerial':'المسيّرة: بصمة مسح دائرية سماوية نحو الأسفل','m.lgGround':'الأرضي: مسح ليدار دوّار أخضر','m.lgMarine':'البحري: حلقات سونار زرقاء (في الماء فقط)',
 'm.lgTargets':'☢ مصدر إشعاع · 🔥 بقعة ساخنة · 💧 تسرّب · ⚠ شذوذ — يومض الهدف بلون الروبوت الذي اكتشفه','m.lgRed':'يتحول الروبوت إلى الأحمر = تم كشف عينة اختبار في إطاره',
 'm.feed':'البث المباشر','m.frame':'الإطار','m.resmap':'خريطة بواقي SRM','m.sendTest':'إرسال عينة اختبار','m.sendClean':'إرسال إطار سليم','m.sentFrom':'يُرسَل من الروبوت المحدد في "التحكم".',
 'm.autoTest':'اختبار تلقائي، الاحتمال','m.rate':'معدل التغيير','m.robot':'الروبوت','m.frames':'إطارات','m.alerts':'إنذارات','m.tptests':'كشف صحيح/اختبارات','m.fpclean':'إنذار كاذب/سليم','m.targets':'أهداف',
 'm.chart':'ثقة الكاشف (احتمال عينة اختبار)','m.log':'سجل الأحداث (الإطارات · اكتشاف الأهداف)',
 'r.ground':'الروبوت الأرضي','r.aerial':'الطائرة المسيّرة','r.marine':'المركبة البحرية','rs.ground':'أرضي','rs.aerial':'جوي','rs.marine':'بحري',
 'tg.rad':'مصدر إشعاع','tg.hot':'بقعة ساخنة','tg.leak':'تسرّب مبرّد','tg.anom':'شذوذ إنشائي','tg.roofhot':'بقعة ساخنة على السطح','tg.intakeleak':'تسرّب عند المأخذ','tg.debris':'حطام عند المأخذ',
 'room.reactor':'قاعة المفاعل','room.pump':'غرفة المضخات','room.control':'غرفة التحكم','room.storage':'المخزن','room.waste':'خزنة النفايات','room.lab':'المختبر / المستشعرات','room.canal':'قناة مأخذ مياه التبريد (من البحر)','room.intake':'المأخذ',
 'z.reactor_hall':'قاعة المفاعل','z.pump_room':'غرفة المضخات','z.control':'التحكم','z.storage':'المخزن','z.waste_vault':'خزنة النفايات','z.corridor':'ممر','z.water_intake':'مأخذ المياه',
 's.optical':'بصري','s.thermal':'حراري','s.sonar':'سونار',
 'ms.idle':'خامل','ms.patrolling':'في دورية','ms.manual':'قيادة يدوية','ms.scanning':'يمسح الهدف {id} ({label})','ms.capturing':'يلتقط إطارًا {sensor}',
 'ms.transmitting':'يرسل البيانات مشفّرة (AES-256-GCM)','ms.flagged':'⚠ تم تمييز الإطار — كُشفت عينة اختبار','ms.clean':'تم التحقق من سلامة الإطار','ms.linkerr':'خطأ في الاتصال',
 'mv.detected':'تم كشف عينة اختبار','mv.clean':'سليم','m.test':'اختبار','m.cleanLbl':'سليم','m.ctl':'◆ تحكم','m.alt':'ارتفاع {a} م',
 'ml.detected':'{robot} اكتشف {kind} <b>{id}</b> — {label} @ ({x},{y})','ml.fail':'{robot}: فشل الطلب: {m}',
 'ml.meta':'الثقة={c} الدرجة={s} العتبة={thr} التصنيف={lbl} {ms} مللي ثانية','ml.layers':'L1 AES-GCM {l1} الوسم={tag} · L2 الحافة {l2} {l2s} · L3 SRM {l3} {l3s} · L4 المعدل {l4} {l4s}/ث · {ms} مللي ثانية','ok':'سليم','fail':'فشل',
 'tour.next':'التالي','tour.back':'السابق','tour.skip':'تخطٍّ','tour.done':'إنهاء','tour.step':'الخطوة {i} من {n}',
 'tour.1t':'خريطة المنشأة','tour.1':'خريطة علوية لمنشأة نووية: غرف وممرات ومناطق ساخنة وقناة لمياه التبريد. تقوم الروبوتات بدوريات هنا، وتغطي بصمات المسح الخاصة بها الأهداف (☢ 🔥 💧 ⚠).',
 'tour.2t':'اختيار الروبوتات','tour.2':'بدّل بين الروبوت الأرضي والطائرة المسيّرة والمركبة البحرية، أو شغّل الثلاثة معًا. يمكنك الإيقاف المؤقت وتغيير السرعة، أو قيادة الروبوت المحدد يدويًا بالأسهم.',
 'tour.3t':'ماذا يفعل كل روبوت الآن','tour.3':'يعرض كل روبوت سطر حالة مباشرًا: في دورية، أو يمسح هدفًا، أو يلتقط إطارًا، أو يرسله مشفّرًا.',
 'tour.4t':'دليل الألوان','tour.4':'لكل روبوت لون وشكل مسح خاص به. يومض الهدف بلون الروبوت الذي اكتشفه، ويتحول الروبوت إلى الأحمر عند تمييز إطاره.',
 'tour.5t':'البث المباشر','tour.5':'آخر إطار (كاميرا أو حراري أو سونار) بجانب خريطة بواقي SRM الخاصة به. تظهر آثار إخفاء البيانات عالية التردد في خريطة البواقي.',
 'tour.6t':'عينات الاختبار والعدادات','tour.6':'أرسل عينة اختبار اصطناعية معلَّمة (أو إطارًا سليمًا) لترى هل يكتشفها الكاشف. يعرض الجدول عدد الإطارات والإنذارات والكشف الصحيح والإنذارات الكاذبة لكل روبوت.',
 'tour.7t':'مخطط الثقة','tour.7':'ثقة الكاشف عبر الزمن، بخط لكل روبوت. النقاط البنفسجية هي عينات اختبار.',
 'tour.8t':'سجل الأحداث','tour.8':'يمر كل إطار بأربع طبقات: AES-256-GCM، وكشف الشذوذ على الحافة، وتحليل الإخفاء SRM، وفحص السلوك. تُسجَّل هنا أيضًا عمليات اكتشاف الأهداف.',
 'i.kicker':'عرض توضيحي لرسالة ماجستير · تأمين بيانات قياس روبوتات التفتيش','i.h1':'كشف البيانات المخفية في صور قياسات الروبوتات',
 'i.lead':'NuclearStegNet محاكٍ تعليمي لـ<b>تحليل الإخفاء (Steganalysis)</b>، أي كشف البيانات المخفية داخل الصور. ترسل روبوتات التفتيش في المنشآت النووية إطارات بصرية وحرارية وسونار إلى مركز العمليات. وقد يقوم روبوت مُخترَق أو شخص من الداخل بإخفاء معلومات داخل هذه الإطارات (إخفاء المعلومات) لتسريبها دون أن يُلاحَظ. يوضح هذا المشروع كيف يمكن فحص هذه الإطارات طبقةً بعد طبقة.',
 'i.start':'▶ بدء محاكاة المهمة','i.analyze':'🔬 تحليل صورة',
 'i.probT':'المشكلة','i.prob':'تبدو صور القياس طبيعية للعين البشرية، لكن تغييرات صغيرة بمقدار ±1 في قيم البكسلات قد تحمل حمولة مخفية. التشفير يحمي قناة الاتصال، لكنه لا يخبرك هل تم التلاعب بمحتوى الصورة نفسها قبل تشفيرها. يبحث تحليل الإخفاء في بواقي الضوضاء الإحصائية للعثور على هذه الآثار.',
 'i.simT':'ماذا يحدث في المحاكاة','i.sim':'تقوم ثلاثة روبوتات بدوريات في منشأة محاكاة. كل ٢–٣ ثوانٍ يلتقط كل روبوت إطارًا اصطناعيًا ويرسله إلى الخادم. ويمكن اختياريًا تحويل الإطار إلى <i>عينة اختبار معلَّمة</i> (تغييرات عشوائية ±1 في المناطق ذات النسيج). ثم يمرر الخادم الإطار عبر أربع طبقات دفاعية ويُعيد الحكم.',
 'i.seeT':'ماذا سترى','i.pipeT':'مسار الكشف','i.doT':'ماذا يمكنك أن تفعل','i.honestT':'ملاحظة بأمانة علمية',
 'i.honest':'جميع قيم TPR/FPR في صفحة المهمة <b>مقيسة على إطارات محاكاة</b> يولّدها هذا البرنامج، وليست على بيانات منشأة حقيقية. وتستخدم صفحة تحليل الصور أوزانًا ثابتة غير مُدرَّبة وقيمًا مرجعية <b>محاكاة</b>. هذه أداة تعليمية وليست منتجًا أمنيًا معتمدًا.',
 'i.see1':'<b>خريطة المنشأة</b> — غرف وممرات ومناطق ساخنة وقناة لمياه التبريد.',
 'i.see2':'<b>٣ روبوتات</b> — روبوت أرضي (<span style="color:#22c55e">ليدار أخضر</span>)، وطائرة مسيّرة (<span style="color:#22d3ee">بصمة سماوية</span>)، ومركبة بحرية (<span style="color:#3b82f6">سونار أزرق</span>).',
 'i.see3':'<b>الأهداف</b> — ☢ إشعاع، 🔥 بقع ساخنة، 💧 تسرّبات، ⚠ حالات شذوذ تومض عند مسحها.',
 'i.see4':'<b>البث المباشر وخريطة البواقي</b> — الإطار وبواقي SRM عالية التردد الخاصة به.',
 'i.see5':'<b>٤ طبقات دفاعية</b> — نتائج كل إطار في السجل مع إنذارات حمراء.',
 'i.see6':'<b>المخططات والعدادات</b> — الثقة عبر الزمن، والإنذارات، والكشف الصحيح والكاذب لكل روبوت.',
 'i.do1':'<b>أرسل عينات اختبار</b> وتحقق هل يكتشفها الكاشف.','i.do2':'<b>قارن بين الروبوتات</b> — تختلف صعوبة الكشف باختلاف المستشعر.',
 'i.do3':'<b>حلّل صورتك الخاصة</b> — ارفع إطارًا وافحص خريطة البواقي وانتباه SE ومنحنى ROC.','i.do4':'<b>اقرأ المقاييس</b> — قيم TPR/FPR المقيسة لكل نوع روبوت وحدودها.',
 'p.robot':'إطار الروبوت','p.robotS':'كاميرا / حراري / سونار','p.aes':'AES-256-GCM','p.aesS':'تشفير + وسم سلامة','p.edge':'شذوذ الحافة','p.edgeS':'فحص سريع على الروبوت',
 'p.steg':'تحليل الإخفاء','p.stegS':'بواقي SRM + SE','p.beh':'السلوك','p.behS':'ملف المعدل / الحجم',
 'm.autoClear':"تنظيف تلقائي للإطارات المشبوهة",
 'm.clear':"🧹 تنظيف",
 'm.cleared':"منظَّفة",
 'm.clearRate':"المنظَّفة والمُعاد التحقق منها / محاولات التنظيف (نسبة النجاح)",
 'm.calibClear':"نجاح التنظيف (التعقيم) {ok}% — {per}",
 'm.calibClearType':"{k}: {ok}% من {n}، PSNR {psnr} ديسيبل، معدل خطأ البت الأقل أهمية {ber}؛ PSNR للإطار السليم إن نُظِّف خطأً {cpsnr} ديسيبل",
 'ms.clearing':"يزيل البيانات المخفية…",
 'ms.cleared':"تم تنظيف الإطار — إعادة الفحص: سليم",
 'ms.clearFail':"فشل التنظيف — تم عزل الإطار",
 'ms.awaitClear':"⚠ إطار مشبوه — بانتظار التنظيف اليدوي",
 'mv.clearing':"جارٍ التنظيف…",
 'mv.cleared':"تم التنظيف ← سليم",
 'mv.clearFail':"فشل التنظيف",
 'ml.clearOk':"تم التعقيم وإعادة التحقق: سليم",
 'ml.clearFail':"لم يجتز التعقيم إعادة التحقق",
 'ml.clearMeta':"PSNR={psnr} ديسيبل SSIM={ssim} الشدة={a} خطأ-LSB={ber} ({ms} مللي ثانية)",
 'ml.rescan':"درجة إعادة الفحص={s} < العتبة={thr}",
 'ev.mrescan':"إعادة الفحص بعد التنظيف {robot} @{zone} ({sensor}): {v} الدرجة={s}",
 'ev.sanitize':"المُعقِّم: الإطار {id} نُظِّف={ok} الشدة={a} PSNR={psnr} ديسيبل",
 'ev.sanitizeUp':"المُعقِّم (صورة مرفوعة): {v0} ← {v1}، الشدة={a}، PSNR={psnr} ديسيبل",
 'tour.9t':"الكشف والتنظيف",
 'tour.9':"عند تمييز إطار مشبوه، يقوم المُعقِّم بتنعيم المناطق ذات النسيج وإعادة تكميمها. يؤدي ذلك إلى جعل نحو نصف البتات الأقل أهمية فيها عشوائية، فتُتلف الحمولة المخفية. ثم يُعاد فحص الإطار عبر الطبقات الأربع. التنظيف التلقائي مفعّل افتراضيًا؛ أوقفه لتنظيف الإطارات يدويًا بهذا الزر.",
 'an.clearBtn':"🧹 إزالة البيانات المخفية",
 'an.clearing':"جارٍ التنظيف…",
 'an.clearT':"الكشف والتنظيف — قبل / بعد",
 'an.before':"قبل (الصورة المُدخلة)",
 'an.after':"بعد (الصورة المنظَّفة)",
 'an.download':"⬇ تنزيل الصورة المنظَّفة",
 'an.clearRes':"{v0} (الدرجة {s0}) ← {v1} (الدرجة {s1}) · PSNR {psnr} ديسيبل · SSIM {ssim} · الشدة {a} · خطأ-LSB {ber}",
 'an.clearNote':"الكاشف المستخدم: {d}. على الصور الحقيقية هذا أسلوب تقريبي: انخفاض الدرجة تحت العتبة لا يثبت زوال الحمولة.",
 'an.notNeeded':"درجة الصورة أصلًا تحت العتبة — لم يتم تغيير شيء.",
 'an.resBefore':"البواقي قبل",
 'an.resAfter':"البواقي بعد",
 'i.do5':"<b>الكشف والتنظيف</b> — تُعقَّم الإطارات المشبوهة تلقائيًا أو بنقرة واحدة، ثم يُعاد التحقق منها عبر الطبقات الأربع.",
 'i.footer':'عرض بحثي أكاديمي — لكشف البيانات المخفية فقط.'
}};
// English is the DEFAULT language. Arabic is used only after an explicit user choice
// (AR toggle or ?lang=ar), stored under LANG_KEY. The legacy key 'nsn_lang' is discarded
// so a stale value saved by older builds can no longer force Arabic on start-up.
const DEFAULT_LANG = 'en';
const LANG_KEY = 'nsn_lang_v2';
let lang = DEFAULT_LANG;
try {
  localStorage.removeItem('nsn_lang');
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'ar' || saved === 'en') lang = saved;
} catch (e) {}
const qp = (location.search.match(/[?&]lang=(ar|en)/) || [])[1];  // ?lang=ar|en overrides and persists
if (qp) { lang = qp; try { localStorage.setItem(LANG_KEY, qp); } catch (e) {} }
if (!D[lang]) lang = DEFAULT_LANG;
function t(k, p) {
  let s = (D[lang][k] !== undefined ? D[lang][k] : (D.en[k] !== undefined ? D.en[k] : k));
  if (p) s = s.replace(/\{(\w+)\}/g, (m, n) => (p[n] !== undefined && p[n] !== null ? p[n] : m));
  return s;
}
function apply() {
  const h = document.documentElement;
  h.lang = lang; h.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body && document.body.classList.toggle('lang-ar', lang === 'ar');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('.lang-btn').forEach(b => { b.textContent = t('lang.btn'); });
}
function setLang(l) {
  lang = D[l] ? l : DEFAULT_LANG;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  apply(); window.dispatchEvent(new CustomEvent('langchange', {detail: lang}));
}
window.I18N = {t, setLang, apply, get lang() { return lang; }, dict: D, DEFAULT_LANG, LANG_KEY};
window.t = t;
document.addEventListener('DOMContentLoaded', () => {
  apply();
  document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar')));
});
})();
