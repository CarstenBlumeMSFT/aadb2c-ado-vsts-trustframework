import * as process from 'process'
import {spawnSync} from 'node:child_process';
import * as path from 'path'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('Upload Policies Client Secret', () => {
  process.env['INPUT_POLICYFOLDER'] = process.env['POLICYFOLDER']
  process.env['INPUT_OUTPUTFOLDER'] = process.env['OUTPUTFOLDER']
  process.env['INPUT_RENUMBERSTEPS'] = 'true'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'index.js')
const result = spawnSync(
  `"${np}"`, [`"${ip}"`],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf-8',
    shell: true,
    env: process.env
  }
);
if (result.stdout)  {
  console.log(result.stdout.toString());
}
if (result.stderr)  {
    console.error(result.stderr.toString());
}

expect(result.stdout).not.toContain("type=error");
expect(result.stdout).not.toContain("result=Failed");
expect(result.stderr).toBeFalsy();
expect(result.status).toBe(0);

})