import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { NavModel, NavModelItem } from '@grafana/data';

import { Branding } from '../Branding/Branding';

export function usePageTitle(navModel?: NavModel, pageNav?: NavModelItem) {
  const { FNDashboard, pageTitle } = useSelector((state) => state.fnGlobleState);
  useEffect(() => {
    const parts: string[] = [];

    if (pageNav) {
      if (pageNav.children) {
        const activePage = pageNav.children.find((x) => x.active);
        if (activePage) {
          parts.push(activePage.text);
        }
      }
      parts.push(pageNav.text);
    }

    if (navModel) {
      if (navModel.node !== navModel.main) {
        parts.push(navModel.node.text);
      }
      parts.push(navModel.main.text);
    }
    parts.push(Branding.AppTitle);
    document.title = !FNDashboard ? parts.join(' - ') : pageTitle ? pageTitle : 'Flux Ninja';
  }, [navModel, pageNav, FNDashboard, pageTitle]);
}
