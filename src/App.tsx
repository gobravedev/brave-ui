import { FC } from "react"
import RenderRouter from './routes';
import { HashRouter } from "react-router";
import { useI18n } from "./hooks/useI18n";
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import { ConfigProvider, theme as antdTheme, Button } from 'antd';
import { useSelector } from "react-redux";
import { setupGlobalMessage } from "./hooks/useGlobalMessage";

const App: FC<any> = () => {
  const { locale, t } = useI18n()
  const antdLocale = locale === 'zh_CN' ? zhCN : enUS
  const { theme } = useSelector((state: any) => state.user) //light dark
  const messageHolder = setupGlobalMessage();

  // const themeConfig =
  //   theme === 'dark'
  //     ? antdTheme.defaultAlgorithm
  //     : antdTheme.defaultAlgorithm;
  return <>
    {/* <Suspense fallback={<Skeleton active></Skeleton>}>
 
    </Suspense> */}
    {messageHolder}
    <ConfigProvider
      theme={{
        algorithm:
          theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
      locale={antdLocale}>
      <HashRouter>
        <RenderRouter></RenderRouter>
      </HashRouter>

    </ConfigProvider>

  </>
}

export default App
