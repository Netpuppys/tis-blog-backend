export type ILoginUser = {
    email: string;
    password: string;
  };
  
  export type ILoginUserResponse = {
    accessToken: string;
    refreshToken?: string;
  };
  
  export type IChangePassword = {
    email: string;
    oldPassword: string;
    newPassword: string;
  };
  
  export type IRefreshTokenResponse = {
    accessToken: string;
  };
  