import { combineReducers } from 'redux';
import { alertReducer  } from './public/alert';
import { changeColorThemeReducer  } from './public/colorTheme';
import { gridLayoutReducer } from './public/gridLayout/reducer';
import { changeLanguageReducer  } from './public/i18n';
import { authReducer  } from './user/auth';
import { getGeetestCaptchaReducer } from './user/captcha';
import { sendEmailVerificationReducer } from './user/emailVerification';
import { passwordReducer  } from './user/password';
import { profileReducer  } from './user/profile';

export const publicReducer = combineReducers({
    colorTheme: changeColorThemeReducer,
    i18n: changeLanguageReducer,
    alerts: alertReducer,
    rgl: gridLayoutReducer,
});

export const userReducer = combineReducers({
    auth: authReducer,
    password: passwordReducer,
    profile: profileReducer,
    sendEmailVerification: sendEmailVerificationReducer,
    captchaKeys: getGeetestCaptchaReducer,
});
