import { Tests } from './lib/tests';
import { Environments } from '../src/app/types/environment.type';
import { expect } from 'chai';
import { promises as fs } from 'fs';

const dataSamplesPath = './test/data/import-openapi/samples/';
const dataReferencesPath = './test/data/import-openapi/references/';

const testSuites = [
  {
    name: 'Swagger v2 format',
    tests: [
      {
        desc: 'Petstore',
        filePath: dataSamplesPath + 'petstore-v2.yaml',
        referenceFilePath: dataReferencesPath + 'petstore-v2.json',
        environmentTitle: 'Swagger Petstore v2'
      },
      {
        desc: 'GitHub',
        filePath: dataSamplesPath + 'github-v2.yaml',
        referenceFilePath: dataReferencesPath + 'github-v2.json',
        environmentTitle: 'GitHub'
      },
      {
        desc: 'Giphy',
        filePath: dataSamplesPath + 'giphy-v2.yaml',
        referenceFilePath: dataReferencesPath + 'giphy-v2.json',
        environmentTitle: 'Giphy'
      },
      {
        desc: 'SendGrid',
        filePath: dataSamplesPath + 'sendgrid-v2.yaml',
        referenceFilePath: dataReferencesPath + 'sendgrid-v2.json',
        environmentTitle: 'SendGrid v3'
      },
      {
        desc: 'Data.gov',
        filePath: dataSamplesPath + 'datagov-v2.yaml',
        referenceFilePath: dataReferencesPath + 'datagov-v2.json',
        environmentTitle: 'Regulations.gov'
      }
    ]
  },
  {
    name: 'OpenAPI v3 format',
    tests: [
      {
        desc: 'Petstore',
        filePath: dataSamplesPath + 'petstore-v3.yaml',
        referenceFilePath: dataReferencesPath + 'petstore-v3.json',
        environmentTitle: 'Swagger Petstore v3'
      }
    ]
  }
];

describe('Swagger/OpenAPI import', () => {
  testSuites.forEach(testSuite => {
    describe(testSuite.name, () => {
      testSuite.tests.forEach(testCase => {
        describe(testCase.desc, () => {
          const tests = new Tests('import');
          tests.runHooks(true, false);

          it('Should import the file', async () => {
            tests.app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG', [
              {
                method: 'showOpenDialog',
                value: { filePaths: [testCase.filePath] }
              }
            ]);

            tests.helpers.sendWebContentsAction('IMPORT_OPENAPI_FILE');

            await tests.helpers.assertHasActiveEnvironment();
            await tests.helpers.assertActiveEnvironmentName(
              testCase.environmentTitle
            );
          });

          it('Environments.json file content should match reference file', async () => {
            await tests.helpers.waitForAutosave();

            const environmentFile = await fs.readFile(
              './tmp/storage/environments.json'
            );
            const referenceEnvironmentFile = await fs.readFile(
              testCase.referenceFilePath
            );

            const environments: Environments = JSON.parse(
              environmentFile.toString()
            );
            const referenceEnvironments: Environments = JSON.parse(
              referenceEnvironmentFile.toString()
            );

            expect(environments)
              .excludingEvery('uuid')
              .to.deep.equal(referenceEnvironments);
          });
        });
      });
    });
  });
});
