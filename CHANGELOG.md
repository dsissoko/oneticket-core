# Changelog

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
