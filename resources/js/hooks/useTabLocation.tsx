import { useSearchParams } from '@/hooks/useSearchParams';
import * as React from 'react';

const useTabLocation = (initialTab: string) => {
  const tab = useSearchParams('tab')?.toString();
  const [tabValue, setTabValue] = React.useState<string>(tab || initialTab);
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    history.pushState({}, '', `${location.pathname}?tab=${newValue}`);

    setTabValue(newValue);
  };

  return {tabValue, handleTabChange};
}

export default useTabLocation;
