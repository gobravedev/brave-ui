import type { FC, ReactElement } from 'react';

// import { useIntl } from 'react-intl';

// import PrivateRoute from './privateRoute';

// export interface WrapperRouteProps extends RouteObject {
//     /** document title locale id */
//     titleId: string;
//     /** authorization？ */
//     auth?: boolean;
// }

const WrapperPipelineComponent: FC<any> = ({ element, ...props }: any) => {
    //   const { formatMessage } = useIntl();

    //   if (titleId) {
    //     document.title = formatMessage({
    //       id: titleId,
    //     });
    //   }
    const Element = element as any
    return <Element {...props} />
};

export default WrapperPipelineComponent;
