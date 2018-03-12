import React, { Component } from 'react';
import { CardTitle, CardMedia } from 'material-ui/Card';
import ImagePlaceholder from 'material-ui/svg-icons/image/photo';

export default class ModifiableImg extends Component {
  render() {
    const { src, alt, width, height } = this.props;
    const imageStyle = {
      width,
      height
    };

    return (
      <CardMedia
        overlay={<CardTitle title="Tap to change image" />}
        onClick={this.onRequestUpload}>
        <div
          style={{
            textAlign: 'center'
          }}>
          <input
            ref={fileInput => { this.fileInput = fileInput; }}
            onChange={this.onUpload}
            accept="image/*"
            style={{
              opacity: 0,
              position: 'absolute',
              width: 0,
              height: 0
            }}
            type="file" />
          {src
            ? (
              <img
                alt={alt}
                src={src}
                style={imageStyle} />
            ) : (
              <ImagePlaceholder
                style={imageStyle} />
            )}
        </div>
      </CardMedia>
    );
  }

  onRequestUpload = () => {
    if ( this.fileInput ) {
      this.fileInput.click();
    }
  };

  onUpload = (evt) => {
    const { onChange } = this.props;
    const files = evt.target.files;

    if ( !files.length ) {
      return;
    }

    onChange(files[0]);
  };
}
