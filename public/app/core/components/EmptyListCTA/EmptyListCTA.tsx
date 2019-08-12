import React, { useContext, MouseEvent } from 'react';
import { CallToActionCard, LinkButton, ThemeContext } from '@grafana/ui';
import { css } from 'emotion';
export interface Props {
  title: string;
  buttonIcon: string;
  buttonLink?: string;
  buttonTitle: string;
  onClick?: (event: MouseEvent) => void;
  proTip?: string;
  proTipLink?: string;
  proTipLinkTitle?: string;
  proTipTarget?: string;
  infoBox?: JSX.Element | string;
  infoBoxTitle?: string;
}

const infoBoxStyles = css`
  max-width: 700px;
  margin: 0 auto;
`;

const EmptyListCTA: React.FunctionComponent<Props> = ({
  title,
  buttonIcon,
  buttonLink,
  buttonTitle,
  onClick,
  proTip,
  proTipLink,
  proTipLinkTitle,
  proTipTarget,
  infoBox,
  infoBoxTitle,
}) => {
  const theme = useContext(ThemeContext);

  const footer = () => {
    return (
      <>
        {proTip ? (
          <span key="proTipFooter">
            <i className="fa fa-rocket" />
            <> ProTip: {proTip} </>
            <a href={proTipLink} target={proTipTarget} className="text-link">
              {proTipLinkTitle}
            </a>
          </span>
        ) : (
          ''
        )}
        {infoBox ? (
          <div key="infoBoxHtml" className={`grafana-info-box ${infoBoxStyles}`}>
            {infoBoxTitle && <h5>{infoBoxTitle}</h5>}
            {infoBox}
          </div>
        ) : (
          ''
        )}
      </>
    );
  };

  const ctaElementClassName = !footer()
    ? css`
        margin-bottom: 20px;
      `
    : '';

  const ctaElement = (
    <LinkButton size="lg" onClick={onClick} href={buttonLink} icon={buttonIcon} className={ctaElementClassName}>
      {buttonTitle}
    </LinkButton>
  );

  return <CallToActionCard message={title} footer={footer()} callToActionElement={ctaElement} theme={theme} />;
};

export default EmptyListCTA;
