const fs = require('fs');
const themesDir = './themes';
const formsDirPath = './forms/desktop';
const path = require('path')

/*
This script scans project widgets _skin_ property and defines which skins
are missing in the project

To run this file:
1) Put it in the project folder
2) Open 'NodeJS command prompt'
3) Input 'cd C:\Users\YOUR_USER_NAME\KonyVizEWS\YOUR_PROJECT_DIRECTORY'
4) Input 'node skinChecker'

WARNING: 
This script does not check responsiveData skins;
*/


if (fs.existsSync(themesDir)){
  const projectSkins = [];
  const projectForms = [];
  const widgetsWithMissingSkins = [];
  const missingSkins = [];
  const themesDirPath = __dirname + '\\' + themesDir.slice(2);
  const foldersInThemes = fs.readdirSync(themesDirPath);

  const isFile = fileName => {
    return fs.lstatSync(fileName).isFile()
  }

  const iterateContent = function(folderPath, whatToDo) { 
    fs.readdirSync(folderPath).map(fileName => {
      const newPath = path.join(folderPath, fileName);

      if (isFile(newPath)) {
        whatToDo(newPath);
      } else {
        iterateContent(newPath, whatToDo);
      }
    });
  };

  const existsInProject = function(skinKuid) {
    if (projectSkins.indexOf(skinKuid) !== -1) {
      return true;
    }
    return false;
  };

  const pushSkinKuidToResult = function(newPath) {
    projectSkins.push(JSON.parse(fs.readFileSync(newPath, 'utf-8')).kuid);
  };

  const projectFormsKuidToResult = function(newPath) {
    const currentWidgetJson = JSON.parse(fs.readFileSync(newPath, 'utf-8'));

    const skinOfCurrentWidget = currentWidgetJson._skin_;
    const skinOfSegmentRow = currentWidgetJson.rowskin;
    const skinOfSegmentRowFocus = currentWidgetJson.rowfocusskin;
    const skinOfSliderLeft = currentWidgetJson.leftskin;
    const skinOfSliderRight = currentWidgetJson.rightskin;

    const skins = [
      skinOfCurrentWidget, 
      skinOfSegmentRow, 
      skinOfSegmentRowFocus, 
      skinOfSliderLeft, 
      skinOfSliderRight
    ];

    skins.forEach((skin) => {
      if (skinOfCurrentWidget) {
        if (existsInProject(skinOfCurrentWidget)) {
          projectForms.push(skinOfCurrentWidget);
        } else {
          widgetsWithMissingSkins.push(newPath);
          missingSkins.push(skinOfCurrentWidget);
        }
      }
    });

    if (      
      !skinOfCurrentWidget &&
      !skinOfSegmentRow &&
      !skinOfSegmentRowFocus &&
      !skinOfSliderLeft &&
      !skinOfSliderRight
      ) {
      console.log('WARNING =========>');
      console.log('CHECHER DOES NOT WORK FOR THIS FILE');
      console.log(newPath);
    }
  };

  iterateContent(themesDirPath, pushSkinKuidToResult);
  iterateContent(formsDirPath, projectFormsKuidToResult);
  // console.log(`===> PROJECT SKINS ARE : ${projectSkins}`);
  // console.log(`===> PROJECT WIDGETS ARE : ${projectForms}`);
  console.log('===> WIDGETS WITH MISSING SKINS ARE :');
  console.log([...new Set(widgetsWithMissingSkins)]);
  console.log('===> MISSING SKINS ARE :');
  console.log([...new Set(missingSkins)]);
};