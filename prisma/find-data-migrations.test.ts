/** @jest-environment node */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { findDataMigrations } from './find-data-migrations'

describe('findDataMigrations', () => {
  let dir: string

  function addMigration(name: string, withDataMigration: boolean) {
    mkdirSync(path.join(dir, name), { recursive: true })
    writeFileSync(path.join(dir, name, 'migration.sql'), '')
    if (withDataMigration) {
      writeFileSync(path.join(dir, name, 'data-migration.ts'), '')
    }
  }

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'find-data-migrations-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns only folders containing a data-migration.ts', () => {
    addMigration('20250101000000_a', true)
    addMigration('20250102000000_b', false)
    addMigration('20250103000000_c', true)

    expect(findDataMigrations(dir)).toEqual([
      '20250101000000_a',
      '20250103000000_c'
    ])
  })

  it('sorts results in timestamp (folder name) order', () => {
    addMigration('20250103000000_c', true)
    addMigration('20250101000000_a', true)
    addMigration('20250102000000_b', true)

    expect(findDataMigrations(dir)).toEqual([
      '20250101000000_a',
      '20250102000000_b',
      '20250103000000_c'
    ])
  })

  it('returns an empty array when no folder has a data-migration.ts', () => {
    addMigration('20250101000000_a', false)

    expect(findDataMigrations(dir)).toEqual([])
  })
})
