import React, { Component } from 'react';
import Product from './Product';

class ProductList extends Component {
    handleUpVoteById(productId) {
      const nextProducts = this.state.products.map(p=> {
        if(p.id == productId)
          return Object.assign({}, p, { votes: p.votes+1 });
        else return p;
      });
      this.setState({products:nextProducts});
    }
    constructor(props) {
      super(props);
      this.state = {
        products: [],
      };
      this.handleUpVoteById = this.handleUpVoteById.bind(this);
    }
    componentDidMount() {
      this.setState({products:window.Seed.products});
    }
  render() {
    return (
      <div className="ui unstackable items">
        <h2>
            A product list
        </h2>
        <hr />
        {this.state.products.sort((a,b)=>b.votes-a.votes).map((product) =>
          <Product
            key={'product-' + product.id}
            id={product.id}
            title={product.title}
            description={product.description}
            url={product.url}
            votes={product.votes}
            submitterAvatarUrl={product.submitterAvatarUrl}
            productImageUrl={product.productImageUrl} 
            onVote={this.handleUpVoteById}/>
          )}
      </div>
    );
  }
}

export default ProductList;