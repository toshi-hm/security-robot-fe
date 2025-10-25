# Claude Code カスタムスラッシュコマンド: 開発開始 (`/start-dev`)

このスラッシュコマンドは、設計書・進捗レポートを読み込み、**テストが全て成功するまで開発を継続**する自律的な実装ループを開始します。  
Git 連携はカスタムコマンド **`/git-commit-push`** を用います。

---

## Main Instruction (Initial Prompt for Claude)

> **Instruction**: Based on the design documents (`instructions/*`) and prompts (`instructions/prompts/*`), please continue the implementation. Progress and development logs up to this point are recorded in `report/PROGRESS.md`, `report/summary/*`, and `report/DIARY*.md`, so make sure to review these first.

> **Constraints and Operational Rules**
>
> - **ALWAYS answer in Japanese**.
> - For each session, always update `report/PROGRESS.md` and the corresponding `report/DIARY*.md`.
> - When the number of entries in `report/DIARY*.md` exceeds **10**, create a **comprehensive summary** in `report/summary/DIARY*.md`, then create a **new index `report/DIARY*.md` file** and **continue appending entries to the new file**.
> - Maintain and achieve **at least 80% unit test coverage** (continue implementing and testing if coverage is insufficient).
> - **Do not stop development until all tests pass**.
> - At logical milestones (each small, self-contained completion), execute **`/git-commit-push`** (Claude Code custom slash command).
> - When encountering ambiguities in the specifications, form a **consistent hypothesis** based on design documents, existing code, and testing policy, then proceed and record the reasoning in the diary.

---

## Execution Flow (Checklist)

1. **Reading**
   - Understand the overall picture from `instructions/00_SUMMARY.md`.
   - Extract key points from `instructions/*` (Design, API, Frontend, Test, Infrastructure).
   - Review `instructions/prompts/*` to align on implementation tone & direction.
   - Carefully read `report/PROGRESS.md`, `report/summary/*`, and `report/DIARY*.md` to extract **recent TODOs, unresolved issues, and reasons for pending tasks**.

2. **Planning (record in `report/DIARY*.md`)**
   - Define this session’s **goals / scope / Definition of Done (DoD)**.
   - List risks, assumptions, and testing perspectives (normal, abnormal, boundary cases).

3. **Implementation & Test-Driven Development**
   - Run existing tests to identify green/red status.
   - Based on the specifications, iterate in the order of **Add Tests → Implement → Refactor**.

4. **Coverage Check (Reference Commands)**
   - Use `pnpm test`. This command is included coverage report (`npx vitest --coverage`).
   - Achieve **at least 80%** for all metrics: statements, branches, lines, and functions.

5. **Report Update**
   - `report/PROGRESS.md`: summarize progress, completed items, incomplete items, and next actions.
   - `report/DIARY*.md`: record start/end times, trial and error, decisions, issues, and reflections.
   - If **diary entries exceed 10**, create a **summary** in `report/summary/DIARY*.md`, then issue a new `report/DIARY{NN+1}.md` to continue logging.

6. **Commit & Push**
   - At each milestone, execute **`/git-commit-push`**.

7. **Exit Criteria**
   - Close the session once **all unit tests pass** and **coverage ≥ 80%** is achieved, then append the completion summary to `report/PROGRESS.md`.

---

## Commit Message Template for `/git-commit-push`

feat(scope): concise summary of the purpose

- Changes: bullet-point list of key implementations/fixes
- Tests: overview and focus of added/updated tests
- Impact: affected areas such as UI/API/Domain/etc.
- Notes: reasons for important decisions or temporary measures (see DIARY for details)

Refs: <related issue or document reference (optional)>

> **Scope examples**: `ui`, `api`, `domain`, `infrastructure`, `tests`, `docs`, etc.  
> **Commit frequency**: keep commits small and meaningful (recommended: logically complete unit of about 1–3 files)

---

## Notes for Appending to `report/DIARY{NN}.md`

### When Exceeding 10 Entries

1. Create a new `report/summary/DIARY{NN}.md` containing a comprehensive summary of the file — lessons learned, bottlenecks, improvement plans, and metric trends.
2. Create a new `report/DIARY{NN+1}.md` and continue logging entries there from that point onward.

---

## Test Operations

- **Mandatory**: Continue development until all unit tests pass.
- For new or modified code, tests should generally be written first (add at least one test to lock down expected behavior).
- If coverage is insufficient, improve it through additional tests, design review, or simplification of branches.
- Utilize `tests/mocks` for mocks/stubs. Separate dependencies for areas with side effects.

---

## Failure Handling

- **Test Failure**: Record the minimal reproducible case in the diary → isolate the cause (input/state/external dependency) → apply targeted fix → rerun tests.
- **Unclear Specification**: Prioritize consistency between design documents and existing implementations. Record any provisional decisions with justification in **`report/DIARY*.md`**.
- **Blockers**: Propose alternatives (scope reduction or phased approach) and document escalation items in **`report/PROGRESS.md`**.

---

## Command Examples

### Development & Build

- Start development server (normal): `pnpm dev`
- Start development server (simulation mode): `pnpm dev:simulation`
- Production build: `pnpm build`
- Start production server: `pnpm start`
- Preview built project: `pnpm preview`

### Lint / Type Checking

- Run all Lint checks: `pnpm lint`
- Run all Lint checks with auto-fix: `pnpm lintfix`
- Run ESLint: `pnpm lint:es`
- Run ESLint with auto-fix: `pnpm lintfix:es`
- Run Stylelint: `pnpm lint:style`
- Run Stylelint with auto-fix: `pnpm lintfix:style`
- TypeScript compile check: `pnpm lint:tsc`
- Vue component type check: `pnpm lint:typecheck`

### Testing

- Unit tests (with coverage): `pnpm test -- --run`
- E2E tests (Playwright): `pnpm e2e`

---

## Coverage Standards

- Maintain **at least 80% coverage** for both branches and functions.
- Example command to generate a coverage report: `pnpm test -- --run`

---

## Output Style (for Claude)

- Log all changes and decisions in `report/DIARY*.md` in real time.
- Update `report/PROGRESS.md` with a summary at the end of each session.
- Execute `/git-commit-push` at appropriate milestones to maintain a robust commit history resilient to interruptions.
- Automatically proceed to the next task only after achieving **all tests passing & coverage ≥ 80%**.
