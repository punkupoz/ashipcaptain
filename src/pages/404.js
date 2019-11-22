import React from 'react';
import Layout from '../components/Layout';

class NotFoundPage extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <main>
          <h1>Not Found</h1>
          <p>Lost in the wild :|</p>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullscreen
          />
          <p>Please send help</p>
        </main>
      </Layout>
    );
  }
}

export default NotFoundPage;
