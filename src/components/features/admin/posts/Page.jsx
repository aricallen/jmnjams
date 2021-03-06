import React, { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from '@emotion/styled';
import { isResolved } from '../../../../utils/meta-status';
import { Spinner } from '../../../common/Spinner';
import { fetchMany } from '../../../../redux/posts/actions';
import { Section } from '../../../common/Structure';
import { Header } from '../Header';
import { Button } from '../../../common/Button';
import { spacing } from '../../../../constants/style-guide';
import { Row } from '../../../common/Tables';

const Cell = styled('div')`
  margin-right: ${spacing.regular}px;
`;

const ListItem = ({ post }) => {
  return (
    <Row onClick={post.onSelect}>
      <Cell>{post.id}.</Cell>
      <Cell>{post.title}</Cell>
    </Row>
  );
};

export const Page = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const postsState = useSelector((state) => state.posts);

  const fetch = () => {
    dispatch(fetchMany());
  };
  useEffect(fetch, []);

  const goToCreatePost = () => {
    history.push('/admin/posts/new');
  };

  const isBusy = !isResolved(postsState.meta.many);

  if (isBusy) {
    return <Spinner variant="large" />;
  }

  const posts = postsState.data.map((post) => ({
    ...post,
    onSelect: () => history.push(`/admin/posts/${post.id}`),
  }));

  return (
    <Fragment>
      <Header title="Posts" Controls={() => <Button onClick={goToCreatePost}>Add Post</Button>} />
      <Section>
        {posts.map((post) => (
          <ListItem key={post.id} post={post} />
        ))}
      </Section>
    </Fragment>
  );
};
