declare module 'styled-components/native' {
  import {ReactNativeStyledInterface} from 'styled-components/native';

  const styled: ReactNativeStyledInterface<any>;
  export = styled;
  export * from 'styled-components';
}
