import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Delay from 'react-delay';
import Paper from 'material-ui/Paper';
// Next two imports are for the theme switcher, in development
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import SettingsDispContainer from '../containers/SettingsDispContainer';
import RSSHolder from '../containers/RSSHolder';
import SearchBarContainer from '../containers/searchBarContainer';
import ButtonListContainer from '../containers/ButtonListContainer';
import About from '../components/About';
import ThemeButton from '../components/ThemeButton.jsx';
import Senti from '../containers/Senti';

injectTapEventPlugin();

const App = () => (
  <MuiThemeProvider>
    <div>
      <Paper className="RSSHolder" zDepth={2}>
        <RSSHolder />
      </Paper>

      <div className="logo">
        <img className="rotatingImage" src="./assets/logo/logo_gfx.png" alt="S" />
        <img className="logoText" src="./assets/logo/logo_text.png" alt="swick" />
      </div>

      <div className="center">
        <Delay wait={500}>
          <SearchBarContainer className="SearchBar" />
        </Delay>
        <div className="ButtonListContainer">
          <ButtonListContainer />
        </div>
      </div>
      <Paper className="bottomNav" zDepth={1}>
        <div className="watsonInfo">
          <Senti />
          <span>
            <Paper zDepth={1}>
              This is the SentiBar. It gets generated by sending lots of tasty
               data to IBM's Watson every hour, and shows an emotion analysis
               of last hour's news.
            </Paper>
          </span>
        </div>
        <SettingsDispContainer />
        <About />
        <ThemeButton />
      </Paper>
    </div>
  </MuiThemeProvider>
);

export default App;
