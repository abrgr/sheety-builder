import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { projectActions } from '../action-creators';
import CircularProgress from 'material-ui/CircularProgress';
import ImagePlaceholder from 'material-ui/svg-icons/image/photo';

class Project extends Component {
  componentDidMount() {
    const {
      projects,
      dispatch,
      match,
      project,
      isLoading,
      error
    } = this.props;

    if ( !isLoading && !error && match.params.projectId !== project.get('id') ) {
      dispatch(
        projectActions.load(
          projects,
          match.params.orgId,
          match.params.projectId
        )
      );
    }
  }

  render() {
    const {
      project,
      isLoading,
      error
    } = this.props;

    if ( isLoading ) {
      return (
        <CircularProgress
          mode="indeterminate" />
      );
    }

    if ( error ) {
      return (
        <p>
          {error}
        </p>
      );
    }

    const imageURL = project.get('imageURL');
    const imageStyle = {
      width: 200,
      height: 200
    };

    return (
      <div>
        <h2>{project.get('name')}</h2>
        <div
          onClick={this.onRequestPhotoUpload}>
          <input
            ref={fileInput => { this.fileInput = fileInput; }}
            onChange={this.onUploadPhoto}
            accept="image/*"
            style={{
              opacity: 0,
              position: 'absolute',
              width: 0,
              height: 0
            }}
            type="file" />
          {imageURL
            ? (
              <img
                alt={project.get('name')}
                src={imageURL}
                style={imageStyle} />
            ) : (
              <ImagePlaceholder
                style={imageStyle} />
            )}
        </div>
      </div>
    );
  }

  onRequestPhotoUpload = () => {
    if ( this.fileInput ) {
      this.fileInput.click();
    }
  };

  onUploadPhoto = (evt) => {
    const { dispatch, project } = this.props;
    const files = evt.target.files;

    if ( !!files.length ) {
      dispatch(
        projectActions.setProjectImage(
          project,
          files[0]
        )
      );
    }
  };
}

export default withRouter(
  connect(
    ({ auth, project, projects }) => ({
      isLoading: project.get('isLoading'),
      error: project.get('error'),
      project: project.get('project'),
      projects: projects.get('projects')
    })
  )(Project)
);
