import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Real-time Tracking',
    Svg: require('../../static/img/undraw_location_tracking.svg').default,
    description: (
      <>
        The WIMP system allows you to track your favorite teachers' availability in real time thanks to the power of IoT.
      </>
    ),
  },
  {
    title: 'Easy to use',
    Svg: require('../../static/img/undraw_user.svg').default,
    description: (
      <>
        The systems system provides a simple and easy-to-use interface for users to use anywhere at anytime.
      </>
    ),
  },
  {
    title: 'A turnkey solution',
    Svg: require('../../static/img/undraw_admin.svg').default,
    description: (
      <>
        The WIMP system is easy and quick to deploy. It is a turnkey solution that can be used by any department of Concordia University.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
