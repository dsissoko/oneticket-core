# Changelog

## [0.8.0](https://github.com/dsissoko/oneticket-core/compare/OneTicket-v0.7.0...OneTicket-v0.8.0) (2026-06-12)


### Features

* **appshell-auth0:** add Auth0-authenticated appshell template ([aea9c5a](https://github.com/dsissoko/oneticket-core/commit/aea9c5a95c50544790ff4c5a6824dfe561474b76))
* **appshell-auth0:** add Auth0-authenticated appshell template ([b446da0](https://github.com/dsissoko/oneticket-core/commit/b446da0b02af041ebf8bae433c5759d2b083362c))
* **pipeline:** sequential execution by default, --parallel opts into FAN-OUT ([0371965](https://github.com/dsissoko/oneticket-core/commit/037196504cdf243325e655f4319763dbfbe640af))
* **pipeline:** sequential execution by default, --parallel opts into FAN-OUT ([cd4e8fb](https://github.com/dsissoko/oneticket-core/commit/cd4e8fb7eae61622b8a18ed57b9f19ae0f3a8502))


### Bug Fixes

* **ci:** prevent deploy-prod from running on pull_request events ([4f9b001](https://github.com/dsissoko/oneticket-core/commit/4f9b0010542d4423af21e76a19639a94a3d8674d))
* **ci:** restrict [@role](https://github.com/role) dispatch to OWNER, COLLABORATOR, MEMBER ([f549719](https://github.com/dsissoko/oneticket-core/commit/f54971910e6af622da700d3fe66858d9bd394ea4))
* **ci:** restrict [@role](https://github.com/role) dispatch to OWNER, COLLABORATOR, MEMBER ([ede0b3f](https://github.com/dsissoko/oneticket-core/commit/ede0b3fe7cdd83afe9065e80846cbc2c3a640266))
* **dispatch:** remove duplicate keys in buildPrompt call ([d7a14bf](https://github.com/dsissoko/oneticket-core/commit/d7a14bfb89517f788bfcb2151f1a53bab93e3a04))
* **docs-site:** ensure .nojekyll in deploy artifact ([a62e0ee](https://github.com/dsissoko/oneticket-core/commit/a62e0ee0d1fa123bf31c0690fdf48fbfde68ee99))

## [0.7.0](https://github.com/dsissoko/oneticket-core/compare/OneTicket-v0.6.0...OneTicket-v0.7.0) (2026-06-10)


### Features

* [@po](https://github.com/po) response for issue [#1058](https://github.com/dsissoko/oneticket-core/issues/1058) ([4153cfa](https://github.com/dsissoko/oneticket-core/commit/4153cfa3a52477d26bd9ba5daed3b6b03ebf1b91))
* **agent-dispatch:** flag --safe — force décomposition manifest strictement séquentielle ([466bc00](https://github.com/dsissoko/oneticket-core/commit/466bc00df4b1ac19ce3ba5de022a5ece14c498d3))
* issue [#1058](https://github.com/dsissoko/oneticket-core/issues/1058) — oneticket readme file ([4ef8a34](https://github.com/dsissoko/oneticket-core/commit/4ef8a34faf372d5f987b786b614a495002bb5fc1))
* issue [#1068](https://github.com/dsissoko/oneticket-core/issues/1068) — Flashcard App — world capitals, flip mode, theme-ready architecture ([b3a06e2](https://github.com/dsissoko/oneticket-core/commit/b3a06e2b51a87be015589d41f47ea9cd527a120b))
* **oneticket:** replace slices with sprints — US-1 template restructuring ([7591c88](https://github.com/dsissoko/oneticket-core/commit/7591c88bc1192463ce60b9a63817b558659b8faa))
* **oneticket:** replace slices with sprints — US-1 template restructuring ([96b33f3](https://github.com/dsissoko/oneticket-core/commit/96b33f37720656520c96b9be8175ee88e3ac610b))
* **oneticket:** US-3 global coherence — slices → sprints in dispatch and US docs ([7b3b0ab](https://github.com/dsissoko/oneticket-core/commit/7b3b0abd9f32d0f7097d102e09de62e90ac599f1))
* **oneticket:** US-3 global coherence — slices → sprints in dispatch, US-007/009/010 ([25bfc92](https://github.com/dsissoko/oneticket-core/commit/25bfc92e5ff658132e89e7a5b908385c394f97ae))
* **test:** add --yes flag to skip interactive confirmation ([773b1c2](https://github.com/dsissoko/oneticket-core/commit/773b1c2b0d6cc817754321c46ac1af61b64a24d1))
* **test:** add --yes flag to skip interactive confirmation in bootstrap.sh ([c62b9d5](https://github.com/dsissoko/oneticket-core/commit/c62b9d5f45a3c6e469884696c05061725a81a75c))


### Bug Fixes

* **ci:** deploy workflow — URLs GitHub Pages dynamiques via GITHUB_REPOSITORY (portable pour les forks) ([9b3bb74](https://github.com/dsissoko/oneticket-core/commit/9b3bb74b44483fd6020dc32b87b1aa925ccea976))
* **ci:** local skills override APM — oneticket-install split in --apm-only / --skills-only, skills-only runs after apm install ([f4ead16](https://github.com/dsissoko/oneticket-core/commit/f4ead16921f3a44041fef74d947f25f51dba44a0))
* **ci:** retry APM install up to 3 times on transient network errors ([c8d58aa](https://github.com/dsissoko/oneticket-core/commit/c8d58aa1dc5832809c032a57468415fc0a3c58b0))
* **ci:** retry APM install up to 3 times on transient network errors ([43e7945](https://github.com/dsissoko/oneticket-core/commit/43e7945a67014bc6a478e33e0bcdcbbbc13ad642))
* **config:** deny task permission — prevent opencode from spawning subagents ([72b3356](https://github.com/dsissoko/oneticket-core/commit/72b3356e352acf2a5095562c903aef36fc1b2b4b))
* **config:** increase chunkTimeout 30s → 60s ([662e054](https://github.com/dsissoko/oneticket-core/commit/662e054fc6fcfb236ec724a45727e0d7837fbf2d))
* **config:** increase chunkTimeout 30s → 60s — prevent write tool interruption on large manifests ([8d454fd](https://github.com/dsissoko/oneticket-core/commit/8d454fd27b4d22abe4bab345d8c40e7190a8ed78))
* **context:** réduire COMMENT_HISTORY_MAX 10→5 et COMMENT_BODY_MAX_CHARS 500→300 ([930bb1c](https://github.com/dsissoko/oneticket-core/commit/930bb1cb0915f17187b69fbf0e19893f0cb50077))
* **context:** réduire COMMENT_HISTORY_MAX 10→5 et COMMENT_BODY_MAX_CHARS 500→300 ([707a226](https://github.com/dsissoko/oneticket-core/commit/707a226c0420aaef2ac80fc33244c446199c6241))
* **context:** réduire taille historique commentaires — 5 commentaires, 300 chars max ([0ba9c6a](https://github.com/dsissoko/oneticket-core/commit/0ba9c6aa803096eb41772b4632fee0f700a32441))
* **oneticket:** remove remaining slice references in epic, us, architecture templates ([8c2713b](https://github.com/dsissoko/oneticket-core/commit/8c2713b7c8102e5a713b3d1245f5551d6b95aa6b))
* **oneticket:** update README.md slice → sprint references, remove issue-766 legacy tasks ([f605773](https://github.com/dsissoko/oneticket-core/commit/f605773104eb13a915780ce17e31de26e5a4b365))
* **orchestrate:** git merge --abort avant commit sur merge-failed — label merge error désormais toujours posé ([ed7b640](https://github.com/dsissoko/oneticket-core/commit/ed7b64055b9b8395c3f573f688b837a788c3ba0a))
* **pipeline:** prevent rogue opencode/dispatch-* branch and PR creation ([bd295c2](https://github.com/dsissoko/oneticket-core/commit/bd295c20bfdef297020bdc57f1ba5b5795ddfc80))
* **pipeline:** prevent rogue opencode/dispatch-* branch and PR creation ([39d895a](https://github.com/dsissoko/oneticket-core/commit/39d895acd2d49c0a1775e1277cd7d4967f31198c)), closes [#1123](https://github.com/dsissoko/oneticket-core/issues/1123)
* **pipeline:** sanitize manifest.json — strip invalid control chars from LLM output ([dd29570](https://github.com/dsissoko/oneticket-core/commit/dd29570ba54c60a599739eb91951753b5a88e5a3))
* **pipeline:** sanitize manifest.json before JSON.parse — strip invalid control chars from LLM output ([3c1c636](https://github.com/dsissoko/oneticket-core/commit/3c1c6362f668ea83f81fc73f23553f3560f8356b))
* **pipeline:** sanitize manifest.json before JSON.parse — strip invalid control chars from LLM output ([7a4c400](https://github.com/dsissoko/oneticket-core/commit/7a4c4008e0c0a624a86b7404e6555d1fd9e14024))
* **release-please:** suppression package apps/appshell obsolète, manifest aligné sur v0.6.0 ([225b5aa](https://github.com/dsissoko/oneticket-core/commit/225b5aada7cfa63d6f88438f603a2a7412daed2c))
* **test:** init-breakout uses [@leaddev](https://github.com/leaddev) not [@po](https://github.com/po) ([63d057c](https://github.com/dsissoko/oneticket-core/commit/63d057cf2640dbcf77a103be7c84c2708354b7ab))
* **test:** init-breakout uses [@leaddev](https://github.com/leaddev) not [@po](https://github.com/po) ([a5febf3](https://github.com/dsissoko/oneticket-core/commit/a5febf3e64c308f6e3c1cc20b5fe513b521fc883))

## [0.6.0](https://github.com/dsissoko/oneticket-core/compare/OneTicket-v0.5.0...OneTicket-v0.6.0) (2026-06-05)


### Features

* [@architect](https://github.com/architect) response for issue [#1036](https://github.com/dsissoko/oneticket-core/issues/1036) ([4dadd67](https://github.com/dsissoko/oneticket-core/commit/4dadd67e1c7dbb96e1a541528d67d932185de140))
* [@po](https://github.com/po) init-doc implemented — init-doc.mjs command mode with git + comment ([240cb2a](https://github.com/dsissoko/oneticket-core/commit/240cb2a30143a9fd4fc2cdc3bcbb0e69ed7d0940))
* add skill loading directive to AGENTS.md instructions — trace dynamic skill loads ([1c2296f](https://github.com/dsissoko/oneticket-core/commit/1c2296f6e0aac7813668dee948363269db086ed6))
* **agent-dispatch:** complement prompt reverse-doc — charge oneticket-retrodoc + skills doc, commit message adapté ([2d44945](https://github.com/dsissoko/oneticket-core/commit/2d449454fedb9ada74d4a63ef1f17949800c19ae))
* bootstrap v1.0.0 pipeline — on-issue-comment, agent-execute, agent-dispatch + APM install ([b61ab29](https://github.com/dsissoko/oneticket-core/commit/b61ab2952f257991702da4d88fa74e454faa4ca4))
* cleanup_on_success — supprime tasks/issue-N/ apres allDone ([07fc89b](https://github.com/dsissoko/oneticket-core/commit/07fc89be61a7ff606284b23cff792e1152372e5e))
* complete FAN-OUT pipeline — dispatch-fanout, on-fanout, createBranch ([4bcfea7](https://github.com/dsissoko/oneticket-core/commit/4bcfea7dd3f1db80dfb048b22670a67b3dcf8920))
* complete task A ([dbd8a39](https://github.com/dsissoko/oneticket-core/commit/dbd8a39c42f445d8a33eeda597839f84fdcfcde9))
* complete task B ([6e42cc3](https://github.com/dsissoko/oneticket-core/commit/6e42cc3002498d896f9cff45fe18e70e6e77b819))
* complete task C ([533490d](https://github.com/dsissoko/oneticket-core/commit/533490d8e5169a731bc676fdb5a2b2f4acb13591))
* complete task D ([510c299](https://github.com/dsissoko/oneticket-core/commit/510c299b15e4870e873916445b0fcdcec775b75b))
* complete task E ([1e7491b](https://github.com/dsissoko/oneticket-core/commit/1e7491b1e574eb52df6664e098e338329c834459))
* complete task H ([0eefd0d](https://github.com/dsissoko/oneticket-core/commit/0eefd0d3034ddbf8a2244c17f3b20e1a7125c4ea))
* complete task I ([9183890](https://github.com/dsissoko/oneticket-core/commit/9183890d800d060ed496ad30594d9319b43361e0))
* complete task M ([ff369d8](https://github.com/dsissoko/oneticket-core/commit/ff369d8605f882bd4af6421e5f1e24a67a164c27))
* complete task P ([d04fc70](https://github.com/dsissoko/oneticket-core/commit/d04fc70198e6c22fe3ef3e20889fe86e8c07acf4))
* complete work for issue [#929](https://github.com/dsissoko/oneticket-core/issues/929) ([cb4f41e](https://github.com/dsissoko/oneticket-core/commit/cb4f41e499a542bc9dfa71ffdb331e49f8cc02b9))
* create PR at first FAN-OUT merge — update body with task list at allDone ([6a81286](https://github.com/dsissoko/oneticket-core/commit/6a812862d5cca077d8dc53da967f2b67df7eccda))
* create PR automatically when files pushed — create-pr.mjs ([e0c1ef0](https://github.com/dsissoko/oneticket-core/commit/e0c1ef0c012300d61941930085ab2a04013c063d))
* dispatch-review-agents — N agents parallèles sur review PR inline ([d87f778](https://github.com/dsissoko/oneticket-core/commit/d87f7786da0623e255fc949a71e1edee489a9f3f))
* dispatch-review-agents — N agents parallèles sur review PR inline ([a106017](https://github.com/dsissoko/oneticket-core/commit/a106017fddc7124048cd8946fe4c550794d2fafd))
* dispatch-review-agents — traitement du body du submit review ([4d4fb75](https://github.com/dsissoko/oneticket-core/commit/4d4fb75c24b200e9088f1903e460d706efa140f8))
* flow direct run — retrait ready for review avant dispatch, label dev error sur issue + PR en cas d'échec ([af2da87](https://github.com/dsissoko/oneticket-core/commit/af2da87014ccaaa01d2d3ed16d630c1553bbbfc8))
* init-template.mjs — scaffold app from template on [@leaddev](https://github.com/leaddev) init-&lt;template&gt; ([f119af1](https://github.com/dsissoko/oneticket-core/commit/f119af18bc0d3790fdb5ca1551a159f9fba7e2df))
* inject agent role via OPENCODE_CONFIG_CONTENT default_agent — APM-native profile loading ([698fee7](https://github.com/dsissoko/oneticket-core/commit/698fee7bb69cff065210c95ac5c383b689e53ad4))
* issue [#1035](https://github.com/dsissoko/oneticket-core/issues/1035) — SpaceInvaders - documentation ([9191a07](https://github.com/dsissoko/oneticket-core/commit/9191a0790a2c90837048af2953c0b3295f41f4ed))
* pipeline v1.0.0 — reverse-doc, dev error label, deploy retrigger, directives réponse agents ([b9a5af6](https://github.com/dsissoko/oneticket-core/commit/b9a5af68646f027b8dbf89f1c3557a0dda589bb1))
* pipeline v1.0.0 — reverse-doc, label flow, agent response directives ([6fb6d0c](https://github.com/dsissoko/oneticket-core/commit/6fb6d0c947559971ddf9287e17f10de63cfd74ab))
* project-specific APM instructions — copy .oneticket/.apm/ to root via oneticket-install ([f1bca14](https://github.com/dsissoko/oneticket-core/commit/f1bca14b5b628632fed161093914d9960afce49c))
* restore docs-site-github-pages.yml — doc site build and deploy pipeline ([5661958](https://github.com/dsissoko/oneticket-core/commit/5661958566526c32a936bb2434c0d82ae928c132))
* **skills:** add oneticket-init-appshell — AppShell bootstrap skill for React+Vite projects ([57ee4e1](https://github.com/dsissoko/oneticket-core/commit/57ee4e12d93c4ca7ef654a78cb2dac15bf2a3c0c))
* Sprint 1 — retry-dispatch, on-pr-comment, on-pr-review-comment, FOLLOWUP updated ([addf15f](https://github.com/dsissoko/oneticket-core/commit/addf15f7993a9dbe0ef6cad682ecd81ad49255cc))
* Sprint 2 — FAN-OUT/GATHER pipeline v1.0.0 ([674beb7](https://github.com/dsissoko/oneticket-core/commit/674beb7903e816ccc3830a9ce575e3be76ce2d4a))
* Sprint 3 — ensure-issue-branch, check-prerequisites, init-doc ([b510979](https://github.com/dsissoko/oneticket-core/commit/b510979b931b7b2b0478f22d5b2fa5661b0ca373))


### Bug Fixes

* add apm compile --target opencode --clean to guarantee AGENTS.md on every run ([6ab3e4c](https://github.com/dsissoko/oneticket-core/commit/6ab3e4c7a1079c038921627a7b3d1a3f3ebe9e74))
* add apm compile --target opencode to generate AGENTS.md from instructions ([1c2bb83](https://github.com/dsissoko/oneticket-core/commit/1c2bb839864627e4a4b016397552881bbd18a74b))
* add explicit Do NOT push directive in agent-dispatch prompt — prevent anomalyco self-push ([3a070ee](https://github.com/dsissoko/oneticket-core/commit/3a070ee975d38188b6fcc36c09ececec2db04d61))
* agent-dispatch — suppression fonctions dupliquées (SyntaxError parseComment) ([702399e](https://github.com/dsissoko/oneticket-core/commit/702399e5755f145429dfda240e5352f6ec0f3328))
* **agent-dispatch:** directives de réponse structurées et symétriques par canal — issue, PR comment, PR review inline, FAN-OUT ([c4147b9](https://github.com/dsissoko/oneticket-core/commit/c4147b98c90b597f696c7a9775c3f43b1b8d6483))
* **agent-dispatch:** prompt [@dev](https://github.com/dev) — exiger un résumé de fin de job avec fichiers modifiés et points de validation visuelle ([a50a8e5](https://github.com/dsissoko/oneticket-core/commit/a50a8e562bf3acdb5001e25e7dc6ce225caa0b7e))
* **agent-dispatch:** retrait ready for review aussi sur pull_request_comment (pas seulement issue_comment) ([61a5f67](https://github.com/dsissoko/oneticket-core/commit/61a5f678ca5620eb923924e6f91aceef54df91cb))
* agent-execute — AGENTS.md ajouté dans .git/info/exclude (artefact CI) ([1f738ad](https://github.com/dsissoko/oneticket-core/commit/1f738ad76131a370969c9547408bf059879ef186))
* agent-execute — retry + notify sur steps.run-agent.outcome == 'failure' ([eab4309](https://github.com/dsissoko/oneticket-core/commit/eab43093ec45530220eedb27ed14f18f7a3b561d))
* agent-execute — retry couvre tous les crashes pre-opencode (Install APM, Checkout, etc.) ([dd20a00](https://github.com/dsissoko/oneticket-core/commit/dd20a00b5a80c2725a730174a99e2c36ecdb921d))
* align direct run prompt with FAN-OUT — explicit commit + Do NOT push directive ([5196231](https://github.com/dsissoko/oneticket-core/commit/519623138850d83410a80fd28b066e804d87eda8))
* check manifest after git checkout in launch-fanout.mjs ([f244c77](https://github.com/dsissoko/oneticket-core/commit/f244c77369f2241f0e6559131c415898165947dd))
* checkout feature/issue-N directly in on-fanout.yml ([8b51914](https://github.com/dsissoko/oneticket-core/commit/8b51914a7579389c8ba70c106bdc3dc7c7b29657))
* copy apm.yml to repo root via oneticket-install.mjs — fix apm install --config error ([968cf91](https://github.com/dsissoko/oneticket-core/commit/968cf9199067c822847a9ee4b31e84f307209dbd))
* create-pr — applyLabel ready-for-review pour direct run uniquement ([98b305c](https://github.com/dsissoko/oneticket-core/commit/98b305ccd906496e0e30d4a3e8f0fc7fd3a67773))
* create-pr — suppression import applyLabel dupliqué (SyntaxError) ([da945b4](https://github.com/dsissoko/oneticket-core/commit/da945b4f5b608ba93068b704df80819047650299))
* create-pr.mjs standalone main() only when executed directly ([01b6e9d](https://github.com/dsissoko/oneticket-core/commit/01b6e9d3f093baa5d29607c29233e9b04eb50275))
* **create-pr:** applyLabel ready for review sur la PR en plus de l'issue — déclenche docs-site deploy ([9e009ae](https://github.com/dsissoko/oneticket-core/commit/9e009aea29d52d0751ce463117ae06461a5fc510))
* **create-pr:** retrigger deploy automatiquement sur PR existante après fix post-FAN-OUT — cycling ready for review ([6577ce2](https://github.com/dsissoko/oneticket-core/commit/6577ce2ded2dbbbbc4f974ead2d8fe1d4d93353b))
* directive réponse inline — DO NOT use other command ([3a99065](https://github.com/dsissoko/oneticket-core/commit/3a99065550b82ef4c1bc1144c15d9d21517941d1))
* dispatch-fanout — skip FAN-OUT si manifest allDone (guard anti-retrigger) ([25f7ad9](https://github.com/dsissoko/oneticket-core/commit/25f7ad96cd7a8f9f7c18611afe111e84887a7768))
* **doc-site:** set sidebar.order: 0 on section index.md — TOC appears first in each group ([2accd72](https://github.com/dsissoko/oneticket-core/commit/2accd72f87eae6883618ad0e45a87f31fcbc14f8))
* docs-site — deploy preview uniquement sur label 'ready for review' (allDone) ([78a8043](https://github.com/dsissoko/oneticket-core/commit/78a80439bf153f4698cc075912222b83d77aef64))
* ensure .agents/skills/ exists before any copy in oneticket-install.mjs ([9a9e0b3](https://github.com/dsissoko/oneticket-core/commit/9a9e0b3813d6396366bf20eaf42ef6120c4f6e27))
* explicit fetch of feature branch before checkout in launch-fanout.mjs ([2ca7612](https://github.com/dsissoko/oneticket-core/commit/2ca7612ee089333e5f1f509369d1afd48414a1cc))
* fanout checkout feature/issue-N delegated to launch-fanout.mjs, not workflow ([45e832f](https://github.com/dsissoko/oneticket-core/commit/45e832fee2006bde0d9b11f5a83eb00d233e0120))
* Gate 0 exits with 0 — handled condition, not a pipeline error ([a4f5822](https://github.com/dsissoko/oneticket-core/commit/a4f58222d3beb7992f0d7d17bf6f127bfd0f9571))
* init-doc — remove branch duplication, ensure-issue-branch + createPR ([8952bde](https://github.com/dsissoko/oneticket-core/commit/8952bdee2d405dbd2162330f687c3229b38b122f))
* init-doc.mjs creates feature branch if absent ([9cdd4dc](https://github.com/dsissoko/oneticket-core/commit/9cdd4dc4be32d0c511088a1ee35195a4b0eafcfd))
* init-template — add ensure-issue-branch + createPR, update FOLLOWUP ([85c798b](https://github.com/dsissoko/oneticket-core/commit/85c798b2540c635bfb533d462fd555f743f46151))
* init-template — remplacement TitleCase compound (AppShell → MonJournal) ([f82447b](https://github.com/dsissoko/oneticket-core/commit/f82447bc230b64c9d2478001ebf872a09a8e31a2))
* labels — dynamique in progress / merge error / ready for review / blocked ([82bb7fb](https://github.com/dsissoko/oneticket-core/commit/82bb7fb6308470dabb81da24bf649b2b7ccfc6a2))
* merge agent-dispatch — keep main version (doublons supprimés) ([d7934d3](https://github.com/dsissoko/oneticket-core/commit/d7934d3267bb60761bf74b2a652e4ac4ed76ba7f))
* on-issue-comment — extraction template via awk (1er mot après init-) ([dd509e4](https://github.com/dsissoko/oneticket-core/commit/dd509e4182b04d59fb96d3ce8fefae3fe3b79f80))
* on-pr-comment — résout head.ref via API pour extraire issue_number + branch ([c3bfe6e](https://github.com/dsissoko/oneticket-core/commit/c3bfe6ed80425f57ae8408a23c631eab2024320f))
* on-pr-review-comment — ajoute pull_request_review comme trigger ([61fc3c8](https://github.com/dsissoko/oneticket-core/commit/61fc3c8fd009edee0aa5e419495895278bfa2ba4))
* on-pr-review-comment — extrait issue_number depuis head.ref (natif payload) ([5470912](https://github.com/dsissoko/oneticket-core/commit/54709129b12f33dea570c2eeff25520eec51faa2))
* orchestrate — applyLabel ready-for-review sur la PR feature (déclenche deploy preview) ([6b89c6c](https://github.com/dsissoko/oneticket-core/commit/6b89c6cca4210c5745751e10bf5043bbe324e58c))
* pass is_fanout_task in retry-dispatch.mjs ([0f12129](https://github.com/dsissoko/oneticket-core/commit/0f12129421e0eb55fccc7965bf3e673d737520a0))
* pin oneticket-skills to tag v0.1.0 — SHA short not valid for apm clone ([e35148a](https://github.com/dsissoko/oneticket-core/commit/e35148ad5c3ae5262e0ac2611370e77fd5236e26))
* retrait AGENTS.md du .gitignore — protection via .git/info/exclude CI uniquement ([e18172f](https://github.com/dsissoko/oneticket-core/commit/e18172ff3d3c4ab23327b9d61e4a1d1c7df43dcf))
* **skills:** add ship/ and run/ to placement rules in oneticket-doc-structure — prevent nesting in how/ ([367eaec](https://github.com/dsissoko/oneticket-core/commit/367eaece5b19481ef4377f156b0c0efdc0e5201f))
* **skills:** correct App.tsx → main.tsx, add routing.test.tsx and handlers block rule in oneticket-appshell ([3ff6cac](https://github.com/dsissoko/oneticket-core/commit/3ff6caca6dab26a7de64028f853a85330c397091))
* skip PR creation when manifest present — FAN-OUT handles it at allDone ([139ed5e](https://github.com/dsissoko/oneticket-core/commit/139ed5ed6ac8ef25e7f225c03a801b0cd3c86572))


### Reverts

* remove skill loading directive from AGENTS.md — no effect on FAN-OUT prompts ([5511e5d](https://github.com/dsissoko/oneticket-core/commit/5511e5d87fb561c8d7bc705f5ffec179775777ac))

## [0.5.0](https://github.com/dsissoko/oneticket-core/compare/v0.4.0...v0.5.0) (2026-06-03)


### Features

* **skills:** add oneticket-init-appshell — AppShell bootstrap skill for React+Vite projects ([57ee4e1](https://github.com/dsissoko/oneticket-core/commit/57ee4e12d93c4ca7ef654a78cb2dac15bf2a3c0c))


### Bug Fixes

* **skills:** correct App.tsx → main.tsx, add routing.test.tsx and handlers block rule in oneticket-appshell ([3ff6cac](https://github.com/dsissoko/oneticket-core/commit/3ff6caca6dab26a7de64028f853a85330c397091))

## [0.4.0](https://github.com/dsissoko/oneticket-core/compare/v0.3.0...v0.4.0) (2026-05-30)


### Features

* **agents:** add autonomous_mode rule to all Routing & Handoff sections ([73db971](https://github.com/dsissoko/oneticket-core/commit/73db971898ef51e0cfbdd3315991dd5f7e4da1db))
* **agents:** add max_tasks config param and update manifest generation guidance ([4a76d60](https://github.com/dsissoko/oneticket-core/commit/4a76d60cc8be6930e2634f950f897d547d7c0266))
* **agents:** inject response style in prompts and add emoji to routing/handoff rules ([35a7db6](https://github.com/dsissoko/oneticket-core/commit/35a7db6951a401fb8aa372f5eaa0a5a95f237e1d))
* **agents:** replace routing/handoff indirection with explicit per-profile rules ([86602a8](https://github.com/dsissoko/oneticket-core/commit/86602a8d1bcf17a386ce42f04a8b75ef888e2da2))
* **apps:** complete all tasks for issue [#879](https://github.com/dsissoko/oneticket-core/issues/879) ([0a2f5a1](https://github.com/dsissoko/oneticket-core/commit/0a2f5a160cf9b0cfba4beb3fb1c4d31f3a9ae522))
* **apps:** complete all tasks for issue [#921](https://github.com/dsissoko/oneticket-core/issues/921) ([8233680](https://github.com/dsissoko/oneticket-core/commit/82336803ab387389a24a1cdd20928a4971e08c48))
* **apps:** replace env-based MSW gating with explicit __ENABLE_MSW__ boolean ([66227d6](https://github.com/dsissoko/oneticket-core/commit/66227d656a4a4989cbbdecb0a105d8b836fe93ff))
* complete task F ([4fc6d7d](https://github.com/dsissoko/oneticket-core/commit/4fc6d7d0bb8d0d14de76549fab656b49b2484701))
* complete task H ([cdb0dfd](https://github.com/dsissoko/oneticket-core/commit/cdb0dfd4766d5c1b74395cc2c485ed03082efac5))
* complete work for issue [#929](https://github.com/dsissoko/oneticket-core/issues/929) ([cb4f41e](https://github.com/dsissoko/oneticket-core/commit/cb4f41e499a542bc9dfa71ffdb331e49f8cc02b9))
* **doc-site:** inject sidebar.order via SIDEBAR_ORDERS map — canonical Starlight ordering ([23d25ea](https://github.com/dsissoko/oneticket-core/commit/23d25eafece813aa2cbb5926e49169338122cb1b))
* **docs:** auto-fix cross-reference links in link-docs.mjs + filename-only convention ([b66743d](https://github.com/dsissoko/oneticket-core/commit/b66743d2f38f61b21cd487a3951d06a8ff5da2b9))
* **skills:** add foundation slice rule to oneticket-vertical-slice ([d21fcd1](https://github.com/dsissoko/oneticket-core/commit/d21fcd1cb4b8678e42115976bdf3e8414c9e9452))
* **skills:** add slice sequencing guidance to oneticket-vertical-slice ([4175f2d](https://github.com/dsissoko/oneticket-core/commit/4175f2d06bad6d420e2fa792f1bc363f53dca212))


### Bug Fixes

* **agents:** po loads oneticket-doc-structure as THIRD ACTION — no exception ([9ba137a](https://github.com/dsissoko/oneticket-core/commit/9ba137a486a4c734c11b0fa4fe807c173672ccf0))
* **agents:** remove orphan sections from po and leaddev profiles ([8095683](https://github.com/dsissoko/oneticket-core/commit/8095683480653ad0060878865a89b4639bf69f0c))
* **apps:** add @/ path alias to vite.config.ts + @types/node for shadcn/ui build ([b0e28a1](https://github.com/dsissoko/oneticket-core/commit/b0e28a10963d9c1e4641c7d7ece3c876905c7afd))
* **apps:** log warning when VITE_LOG_LEVEL not set + add VITE_LOG_LEVEL=debug in CI workflow ([daa2bd5](https://github.com/dsissoko/oneticket-core/commit/daa2bd5cbdd30b1aefa09fbc4e2f6f60fcc023c3))
* **apps:** replace &lt;a href&gt; with &lt;Link to&gt; for internal navigation ([8f77717](https://github.com/dsissoko/oneticket-core/commit/8f77717bc94ef1e2a9ceefeb8a5a4e9e9f99198b))
* **ci:** deploy-preview no longer blocked by build-app failure ([5c2022a](https://github.com/dsissoko/oneticket-core/commit/5c2022addd39cafe7609d30801aa35c8089758f5))
* **ci:** fix indentation in Build full prompt step — broken YAML caused workflow_dispatch to disappear ([873bffd](https://github.com/dsissoko/oneticket-core/commit/873bffdefa32962abf1db9e0e7fdd6bc7b6674dd))
* **ci:** revert Build full prompt step — directives already in .mjs files ([9f25fe0](https://github.com/dsissoko/oneticket-core/commit/9f25fe0b7aac3b8b1c2f789e0b48f2ad0078ce2a))
* **ci:** use env vars in Build full prompt step — avoid YAML/bash injection ([6f6ed53](https://github.com/dsissoko/oneticket-core/commit/6f6ed536e971d03762dde79f428dde7647656cfa))
* **config:** expose max_tasks in loadConfig() return value ([fc09ada](https://github.com/dsissoko/oneticket-core/commit/fc09ada44d092138eb87d141ce655a4717b36578))
* **doc-site:** set sidebar.order: 0 on section index.md — TOC appears first in each group ([2accd72](https://github.com/dsissoko/oneticket-core/commit/2accd72f87eae6883618ad0e45a87f31fcbc14f8))
* **docs:** fix link resolution for duplicate filenames in fixCrossRefLinks ([1121346](https://github.com/dsissoko/oneticket-core/commit/1121346b94138de0fd8b84fc42840533d427f8e4))
* **docs:** move appshell-reuse.md to .oneticket/docs/run/ — framework runbook not appshell doc ([28a4e58](https://github.com/dsissoko/oneticket-core/commit/28a4e58b0a07d8fb0b3f70919a1b21d0d2c8f536))
* **docs:** move run/ to docs root, add ship/ section, add favicon.svg ([d3822e8](https://github.com/dsissoko/oneticket-core/commit/d3822e8f83059697d2110c4a4f814000a71a53dc))
* **docs:** use destDir instead of docSource for URL resolution in transformMarkdown ([ace9ba0](https://github.com/dsissoko/oneticket-core/commit/ace9ba0edbd941d17bf116b99aede6ee1677277f))
* **pipeline:** add 2s delay between individual workflow dispatches ([ed42210](https://github.com/dsissoko/oneticket-core/commit/ed42210af925724f65ee215571b222a2f3d997c9))
* **pipeline:** inject Do NOT push/PR directives in all dispatch paths ([5ca0dae](https://github.com/dsissoko/oneticket-core/commit/5ca0dae971097e17da1f7b1ffbc39aa4c0700170))
* **pipeline:** inject max_tasks into agent-launcher prompt ([885070d](https://github.com/dsissoko/oneticket-core/commit/885070d72149256382e452f3fb125db959a86c9d))
* **po:** restore manifest-generation skill loading and delegation guidance ([dcd4101](https://github.com/dsissoko/oneticket-core/commit/dcd410157050b2310620bdd92bb4c108513b57eb))
* **skills:** add ship/ and run/ to placement rules in oneticket-doc-structure — prevent nesting in how/ ([367eaec](https://github.com/dsissoko/oneticket-core/commit/367eaece5b19481ef4377f156b0c0efdc0e5201f))
* **skills:** enforce max_tasks with explicit count-and-group directive ([44b835f](https://github.com/dsissoko/oneticket-core/commit/44b835f3e381f8441b1d1dcc744c8520ac1e4167))
* **skills:** fix cross-reference paths and solidify agent guidance ([7f65788](https://github.com/dsissoko/oneticket-core/commit/7f657885ddc50fe52279adde9f8006b593e72d2b))
* **templates:** fix relative path to epic in us.md template ([a2fc52d](https://github.com/dsissoko/oneticket-core/commit/a2fc52ddd9d686cb76572430abf3c95a354ec762))


### Reverts

* undo Do NOT push/PR injection — broke agent-execute.yml YAML ([2d5bb86](https://github.com/dsissoko/oneticket-core/commit/2d5bb8613130b6b1f403d38ca849f0a211e37d01))

## [0.3.0](https://github.com/dsissoko/oneticket-core/compare/v0.2.0...v0.3.0) (2026-05-28)


### Features

* add monjournal test mode in create-issues.sh ([81a9ff1](https://github.com/dsissoko/oneticket-core/commit/81a9ff1f65fa02e02ea46f40f3ebb62bd6029875))
* add pipeline labels — in progress, blocked, ready for review, merge error ([1cea7df](https://github.com/dsissoko/oneticket-core/commit/1cea7df3519a4f07c441cd4dd0bdefc217c0467d))
* **agents:** add [@leaddev](https://github.com/leaddev) — implementation planner that decomposes slices into manifest tasks for [@dev](https://github.com/dev) ([8989310](https://github.com/dsissoko/oneticket-core/commit/898931037492fc8dd7226ed97a70bfdf0dd776ed))
* **agents:** promote analyst as default doc producer — epic, user stories, product-spec delegated to analyst by default ([ec6650b](https://github.com/dsissoko/oneticket-core/commit/ec6650bb45287837827dc4d31512800a139ea743))
* **ci:** add app build and deploy to GitHub Pages workflow ([c46443c](https://github.com/dsissoko/oneticket-core/commit/c46443c6e329410a6122ce744b7ad8d93bc3c3ac))
* complete all tasks for issue [#634](https://github.com/dsissoko/oneticket-core/issues/634) ([d38d77b](https://github.com/dsissoko/oneticket-core/commit/d38d77bfb4c58e34030a7f513b1ad9d1b23186ec))
* complete all tasks for issue [#766](https://github.com/dsissoko/oneticket-core/issues/766) ([2ea238a](https://github.com/dsissoko/oneticket-core/commit/2ea238a78f37cbcc38b5163be201b4a5d97de4c1))
* complete task A ([74bfb01](https://github.com/dsissoko/oneticket-core/commit/74bfb01ada046f8a5bbe195640826e85c2c1856b))
* complete task H ([782b4ce](https://github.com/dsissoko/oneticket-core/commit/782b4cec9bd911707a50efd907dcc6fb9b530140))
* complete task R - GitHub Actions CI/CD workflow and Vite optimization ([095e46d](https://github.com/dsissoko/oneticket-core/commit/095e46d08c670741cba535546966955251579ca4))
* inject comment history in agent prompts via build-context.mjs — add response concision directive in AGENTS.md ([e0579a3](https://github.com/dsissoko/oneticket-core/commit/e0579a30bb6dac52650d433572fb9b46201589c3))
* **orchestrate:** post pipeline progress comment after each done/merge-failed ([656aabf](https://github.com/dsissoko/oneticket-core/commit/656aabf062fdc4a9467582fb2180f513bec5553b))
* **orchestrate:** post pipeline progress comment after each done/merge-failed ([40357d6](https://github.com/dsissoko/oneticket-core/commit/40357d6f3d43c39fc5847696931f6780c6dd1287)), closes [#780](https://github.com/dsissoko/oneticket-core/issues/780)
* **pipeline:** add C4 and slices to init-knowledge production process — architect after all US, C4 and slices after architecture ([dd7f571](https://github.com/dsissoko/oneticket-core/commit/dd7f571b2ef30e7f498837f61f7fe7d8007248e2))
* **skills:** add game-engine skill from awesome-copilot — reference in analyst, architect and dev profiles ([d69c8d3](https://github.com/dsissoko/oneticket-core/commit/d69c8d37b7644ac269444c686ae044dfa3cb800e))
* **slices:** strengthen slice production — coverage rule, descriptive H1, architect sequence, init-knowledge precision ([341f63c](https://github.com/dsissoko/oneticket-core/commit/341f63cc3f59cd14b208a60fa57fec943eb1d0f9))


### Bug Fixes

* add code location directive in dev agent profile ([d5c49c8](https://github.com/dsissoko/oneticket-core/commit/d5c49c8ba7a442254dc2d8183ba8ae26bf9624f5))
* add guard in link-docs.mjs when doc source directory does not exist ([278ae9d](https://github.com/dsissoko/oneticket-core/commit/278ae9d0d7b5c5ed4727d82a22f39baa03277145))
* add HTML comments in templates to guide [@architect](https://github.com/architect) for cross-references ([68db3b8](https://github.com/dsissoko/oneticket-core/commit/68db3b8eaf31123e44c7963acfaa1f8d321ddcf3))
* add HTML directive comments in epic and us templates to guide analyst for cross-references ([b4c56b7](https://github.com/dsissoko/oneticket-core/commit/b4c56b74127bdb09f5a16dc171db9ebf2bc3e8b1))
* **architect:** load oneticket-vertical-slice as THIRD ACTION — always produce slices after C4 ([bcd71bd](https://github.com/dsissoko/oneticket-core/commit/bcd71bd0b2bff34838362d1fc09180047d419f8e))
* **ci:** fix build-app — remove delegated workflow check, always use npm directly ([10e3e76](https://github.com/dsissoko/oneticket-core/commit/10e3e76e1d5e4317b441dc85d11c28c33ee7b880))
* **ci:** pass VITE_BASE_PATH to app build — fixes blank page on GitHub Pages sub-path ([fd00eaf](https://github.com/dsissoko/oneticket-core/commit/fd00eafb57a31aaa0afc06c89a679000ad0e23d4))
* **ci:** prefix VITE_BASE_PATH with /oneticket-core/ for correct GitHub Pages path ([3c40afb](https://github.com/dsissoko/oneticket-core/commit/3c40afbdd7479fd43455cf7d62d289abab5394fd))
* deduce DOC_SOURCE from git diff instead of config.yml — restrict push trigger to main and feature branches ([c03e155](https://github.com/dsissoko/oneticket-core/commit/c03e1559d9f840eb7c8827ac9ca189861a4bede0))
* **doc-site:** use double quotes for YAML title — handles typographic apostrophes in French titles ([0b53ccc](https://github.com/dsissoko/oneticket-core/commit/0b53ccce4886a18cf3068213ce6f4e93000decb4))
* **docs:** restore C4Deployment diagram + use img-png strategy in rehype-mermaid for robust C4 rendering ([afa605c](https://github.com/dsissoko/oneticket-core/commit/afa605c57ab444ed0c2881d333f9c75dd2ea01fd))
* enforce single manifest rule in init-knowledge — all 8 steps must be included in one manifest ([8682c61](https://github.com/dsissoko/oneticket-core/commit/8682c618a990e961205b63022a8ac81a619417fe))
* **execute:** guard against invalid branch names in agent-execute workflow ([912deb1](https://github.com/dsissoko/oneticket-core/commit/912deb1634af852f144947f179eae2389fe9680b))
* **execute:** guard against invalid branch names in agent-execute workflow ([2335ffd](https://github.com/dsissoko/oneticket-core/commit/2335ffd88b893c31952ffb0b36b525da1d82eabc))
* **fanout:** batch dispatches by 4 with 3s delay — prevent GitHub Actions concurrency cancellations ([3e41540](https://github.com/dsissoko/oneticket-core/commit/3e4154061680d5510739eaba77452ee144cbd05d))
* **po:** clarify architect role covers C4 diagrams and slices in delegation example ([bcd71bd](https://github.com/dsissoko/oneticket-core/commit/bcd71bd0b2bff34838362d1fc09180047d419f8e))
* **po:** prefer delegation to analyst for epics/US and architect for architecture/C4/slices ([525bd4c](https://github.com/dsissoko/oneticket-core/commit/525bd4cb699ad945b60dba6c50b335bc9c182aa3))
* prefix resolved .md links with ASTRO_BASE in link-docs.mjs — fixes cross-reference URLs on all deploy paths ([81bbcfb](https://github.com/dsissoko/oneticket-core/commit/81bbcfbab3071c8cb14879d398ec352bce0e48bf))
* remove cross-reference directives from vertical-slice skill — move to init-knowledge step 8 as absolute last task rule ([c646a27](https://github.com/dsissoko/oneticket-core/commit/c646a2762be9635f980ab01a03fcb485917d55cd))
* remove feature/** push trigger from doc site workflow — PR trigger is sufficient for previews ([7d79d4d](https://github.com/dsissoko/oneticket-core/commit/7d79d4d69d06053ebd07fdf66af05ee189f00378))
* rename duplicate Step 3 to Step 4, replace inline template with reference in vertical-slice skill ([f15a05c](https://github.com/dsissoko/oneticket-core/commit/f15a05c76760a2d84a8505b2aa2a95d56f564de4))
* resolve relative .md links to absolute Starlight URLs in link-docs.mjs ([01116c6](https://github.com/dsissoko/oneticket-core/commit/01116c6eba5e5f5b16ed845c13623e4d369cf69e))
* separate slice production from cross-references in init-knowledge process — step 8 is a single sequential task ([c3d647a](https://github.com/dsissoko/oneticket-core/commit/c3d647ac3f4da84728ad31869511ab392a9159ab))
* strip existing frontmatter and convert .md links to Starlight URLs in link-docs.mjs ([5537ea1](https://github.com/dsissoko/oneticket-core/commit/5537ea12d3a50f90144cc96f23e7bc895a066962))
* use env vars for free-text fields in test-inline-comment workflow to prevent bash injection ([5f89bb1](https://github.com/dsissoko/oneticket-core/commit/5f89bb15137a411d33a0b1b32d12ef97a0fe3c16))
* use gh api --field body= instead of gh issue/pr comment to prevent bash injection in agent responses ([43722a7](https://github.com/dsissoko/oneticket-core/commit/43722a7abcff5a48ffea63ab576240f1dcec12a6))
* use ONETICKET_GH_PAT in release-please, ignore apps/** changes ([5b1d1ba](https://github.com/dsissoko/oneticket-core/commit/5b1d1ba68aee085353a223b4fff1d0d704c3efc9))
