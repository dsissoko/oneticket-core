# C2 — Containers

## Summary

Technical containers that make up oneticket-core and their interactions.

## Diagram

```mermaid
C4Container
  title Container Diagram — OneTicket Core

  Person(developer, "Developer", "Invokes agents, reviews PRs")

  Container_Boundary(oneticket, "oneticket-core") {

    Container_Boundary(triggers, "Trigger Workflows") {
      Container(on_issue, "on-issue-comment.yml", "GitHub Actions", "Detects @role on issues — ORIGIN_TYPE=issue_comment")
      Container(on_pr, "on-pr-comment.yml", "GitHub Actions", "Detects @role on PR comments — ORIGIN_TYPE=pull_request_comment")
      Container(on_review, "on-pr-review-comment.yml", "GitHub Actions", "Detects @role on inline review comments — ORIGIN_TYPE=pull_request_review_comment")
    }

    Container_Boundary(orchestration, "Deterministic Orchestration") {
      Container(dispatch, "agent-dispatch.mjs", "Node.js ESM", "Parses @role, resolves project context, builds system prompt, dispatches agent-execute")
      Container(fanout, "agent-launcher.mjs", "Node.js ESM", "FAN-OUT — marks tasks in_progress, dispatches parallel workers")
      Container(gather, "orchestrate.mjs", "Node.js ESM", "GATHER — merges task branches, resolves DAG, creates final PR")
      Container(config, "config.mjs + utils.mjs", "Node.js ESM", "Shared helpers — config loading, git operations, manifest read/write")
    }

    Container_Boundary(agentic, "Agentic Execution") {
      Container(execute, "agent-execute.yml", "GitHub Actions + opencode", "Single LLM invocation point — runs agent with built prompt")
    }

    Container_Boundary(skills_local, "Local Skills") {
      Container(skills, ".oneticket/skills/", "Markdown", "Framework skills — manifest-generation, init-knowledge, c4, vertical-slice, etc.")
    }

    Container_Boundary(skills_apm, "APM Skills — planned V1") {
      Container(apm_skills, "APM registry", "Microsoft APM", "Versioned skill and profile distribution — installed at CI runtime via apm install")
    }

    Container_Boundary(docs, "Documentation") {
      Container(doc_source, ".oneticket/docs/ or apps/<project>/docs/", "Markdown", "Structured documentation — what/, how/, ship/, run/")
      Container(doc_site, "doc-site/", "Astro + Starlight", "Static site generator — consumes doc_source, renders Mermaid C4")
    }

    ContainerDb(manifest, ".oneticket/tasks/issue-N/manifest.json", "JSON", "DAG of tasks — status tracking (pending/in_progress/done)")
    ContainerDb(config_yml, ".oneticket/config.yml", "YAML", "Single source of truth — current_project, model, git identity, retry settings")
  }

  System_Ext(github_api, "GitHub API", "Issues, PRs, branches, workflow dispatch, comments")
  System_Ext(gh_pages, "GitHub Pages — gh-pages branch", "Hosts generated static documentation site")
  System_Ext(opencode_rt, "opencode / anomalyco", "LLM runtime — executes agent with prompt")

  Rel(developer, on_issue, "Comments @role on issue")
  Rel(developer, on_pr, "Comments @role on PR")
  Rel(developer, on_review, "Comments @role on PR diff line")

  Rel(on_issue, dispatch, "COMMENT_BODY, ISSUE_NUMBER, ORIGIN_TYPE")
  Rel(on_pr, dispatch, "COMMENT_BODY, PR_NUMBER, ORIGIN_TYPE")
  Rel(on_review, dispatch, "COMMENT_BODY, REPLY_TO_COMMENT_ID, ORIGIN_TYPE")

  Rel(dispatch, config_yml, "Reads current_project, model, language")
  Rel(dispatch, execute, "Dispatches with built prompt + branch")
  Rel(execute, opencode_rt, "Runs agent with OPENCODE_CONFIG_CONTENT")
  Rel(execute, manifest, "Agent writes manifest.json")
  Rel(execute, fanout, "Triggers FAN-OUT if manifest present")
  Rel(fanout, execute, "Dispatches N parallel worker jobs")
  Rel(execute, gather, "Triggers GATHER after task completion")
  Rel(gather, github_api, "Merges branches, creates PR")
  Rel(execute, skills, "Agent loads local skills at runtime")
  Rel(apm_skills, execute, "Installs versioned skills before agent run")
  Rel(doc_site, doc_source, "Consumes Markdown source")
  Rel(doc_site, gh_pages, "Deploys static site")
```

## Notes

- Local skills in `.oneticket/skills/` are installed via `oneticket-install.mjs` at each CI run
- APM will complement (not replace) local skills — local skills persist for framework-level knowledge
- `doc-site-static/` is a CI artifact — never committed to the repository
- The deterministic/agentic boundary is strict: only `agent-execute.yml` invokes an LLM
