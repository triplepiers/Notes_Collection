# Skills

## 1 Database

### 1.1 Postgres

#### Supabase

> [postgres-best-practices-for-ai-agents](https://github.com/supabase/agent-skills)

- Intro: 包含来自 8 个大类的 30+ Postgres 最佳实践规则

    | Priority | Category | Impact | Prefix |
    |----------|----------|--------|--------|
    | 1 | Query Performance | CRITICAL | `query-` |
    | 2 | Connection Management | CRITICAL | `conn-` |
    | 3 | Security & RLS | CRITICAL | `security-` |
    | 4 | Schema Design | HIGH | `schema-` |
    | 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
    | 6 | Data Access Patterns | MEDIUM | `data-` |
    | 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
    | 8 | Advanced Features | LOW | `advanced-` |

- Install

    ```bash
    # as a Vercel Skill
    npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices

    # for Claude Code
    /plugin marketplace add supabase/agent-skills
    /plugin install postgres-best-practices@supabase-agent-skills
    ```
