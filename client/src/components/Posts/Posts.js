import React from 'react';
import { Grid, CircularProgress, Paper } from '@material-ui/core';
import { useSelector } from 'react-redux';

import Post from './Post/Post';
import useStyles from './styles';
import errorimg from '../../images/error.png';

const Posts = ({ setCurrentId }) => {
    const { posts , isLoading } = useSelector((state) => state.posts); 
    const classes = useStyles();

    if( !posts.length && !isLoading)
        return (
          <div >
            <img className = {classes.nopost} src = {errorimg} />
          </div>
        );

  
    return (
        isLoading ? <CircularProgress /> : (      
        <Grid className={classes.container} container alignItems="stretch" spacing={3}>
            {posts?.map((post) => (
              <Grid key={post._id} item xs={12} sm={12} md={6} lg={4}>
                <Post post={post} setCurrentId={setCurrentId} />
              </Grid>
            ))}
          </Grid>
        )
  );
};

export default Posts;
