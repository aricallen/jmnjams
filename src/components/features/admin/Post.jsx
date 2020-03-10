import React, { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PostEditor } from './PostEditor';
import { Button } from '../../common/Button';
import { Header, HeaderActions } from './Header';
import { isBusy, isResolved } from '../../../redux/utils/meta-status';
import { createOne, updateOne, fetchOne } from '../../../redux/posts/actions';
import { Header1 } from '../../common/Structure';
import { Spinner } from '../../common/Spinner';

export const Post = ({ history, match }) => {
  const dispatch = useDispatch();
  const postsState = useSelector((state) => state.posts);
  const defaultPost = { title: '', content: '' };
  const [post, setPost] = useState(defaultPost);

  const { postId } = match.params;
  const isExisting = postId !== undefined;

  const fetch = () => {
    if (isExisting) {
      dispatch(fetchOne(postId));
    }
  };
  useEffect(fetch, []);

  if (isResolved(postsState.meta.one)) {
    const existingPost = postsState.data.find((p) => p.id === +postId);
    if (existingPost && post.id !== existingPost.id) {
      setPost(existingPost);
    }
  }

  const onChange = (postValues) => setPost(postValues);

  const cancelCreate = () => {
    history.push('/admin/posts');
  };

  const onSavePost = async () => {
    if (isExisting) {
      await dispatch(updateOne(post));
    } else {
      await dispatch(createOne(post));
    }
    history.push('/admin/posts');
  };

  return (
    <Fragment>
      <Header>
        <Header1>{isExisting ? 'Edit Post' : 'New Post'}</Header1>
        <HeaderActions>
          <Button variant="secondary" onClick={cancelCreate} disabled={isBusy(postsState.meta.one)}>
            Cancel
          </Button>
          <Button onClick={onSavePost} isBusy={isBusy(postsState.meta.one)}>
            Save
          </Button>
        </HeaderActions>
      </Header>
      {isBusy(postsState.meta.one) ? (
        <Spinner variant="large" />
      ) : (
        <PostEditor post={post} onChange={onChange} />
      )}
    </Fragment>
  );
};