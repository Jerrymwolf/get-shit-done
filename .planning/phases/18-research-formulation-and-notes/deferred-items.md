# Deferred Items - Phase 18

## Pre-existing Test Failure

- **namespace.test.cjs**: "no old long path in .planning/ tree" fails because `.planning/phases/17-namespace-migration/17-VERIFICATION.md` contains an old namespace reference. This is a Phase 17 artifact, not caused by Phase 18 changes.
- **run-tests.cjs**: Was referencing `tests/` (plural) directory that doesn't exist; fixed to `test/` (singular) as part of 18-04 Task 3 (Rule 3 - blocking issue).
