import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { Menu, SideBar, Filter, VerticleCardItem, Footer } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import Auth from './Auth';

import { BASE_URL, MENUS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, ARTICLE_LOGOUT } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import './style.css';
import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Filter.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var query_array = [];
var final_query = "";
var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class SearchResult extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			searchResult: [],
			isFilterOpen: false,
			categories: [],
			sources: [],
			hashtags: [],
			filters: [],
			final_query: "",
			loadingPagination: false,
			page : 0,
			next: null,
			previous: null,
			isSideOpen: true,
			domain: "domain="+DOMAIN,
			isLoading: false,
			modal: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			username: cookies.get('full_name'),
			bookmark_ids: []
		};
	}

	loggedInUser = (data) => {
		this.setState({
			username: data,
			is_loggedin: true
		})
	}

	toggle = (data) => {
		this.setState({
			modal: !data,
		})
	}

	fetchArticleBookmark = (articleId) => {
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
		var url = ARTICLE_BOOKMARK+"?"+this.state.domain;
		var body = JSON.stringify({article_id: articleId})
		postRequest(url, body, this.articleBookmarkResponse, "POST", headers)
	}

	articleBookmarkResponse = (data) => {
		var bookmark_obj = data.body.bookmark_article
		var index = article_array.indexOf(bookmark_obj.article);
		
		if (article_array.includes(bookmark_obj.article) === false && bookmark_obj.status === 1) {
			article_array.push(bookmark_obj.article)
		}
		
		if (article_array.includes(bookmark_obj.article) === true && bookmark_obj.status === 0) {
			article_array.splice(index, 1);
		}
		this.setState({
			bookmark_ids: article_array
		})
	}

	getNext = () => {
		this.setState({
			isLoading: true,
			loadingPagination: true,
			page : this.state.page + 1
		})
		getRequest(this.state.next, this.getSearchResult, false, true);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.6) {
			if (!this.state.loadingPagination && this.state.next){
				this.getNext();
			}
		}
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name;
				heading_dict['itemurl'] = "news/"+item.heading.name.replace(" ", "-").toLowerCase();
				heading_dict['item_id'] = item.heading.category_id;
				heading_dict['item_icon'] = item.heading.icon
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	toggleFilter = () => {
		this.setState({
			isFilterOpen: !this.state.isFilterOpen
		})
	}

	getSearchResult = (data, extra_data) => {
		const filters = [];
		var searchresult_array = [];
		var source_filters = data.body.filters.source;
		var hashtags_filters = data.body.filters.hash_tags;
		var cat_filters = data.body.filters.category;
		if(cat_filters) {
			var cat_array = [];
			cat_filters.map((item, index) => {
				if(item.key !== ""){
					var category_dict = {}
					category_dict['label'] = item.key
					category_dict['value'] = item.key
					cat_array.push(category_dict)
				}
			})
			filters.push({"catitems":"Category" ,"subitem": cat_array})
			this.setState({
				filters: filters
			})
		}
		if(source_filters) {
			var source_array = [];
			source_filters.map((item, index) => {
				if(item.key !== ""){
					var source_dict = {}
					source_dict['label'] = item.key
					source_dict['value'] = item.key
					source_array.push(source_dict)
				}
			})
			filters.push({"catitems":"Source" ,"subitem": source_array})
			this.setState({
				filters: filters
			})
		} 
		if(hashtags_filters) {
			var hashtags_array = [];
			hashtags_filters.map((item, index) => {
				if(item.key !== ""){
					var hashtags_dict = {}
					hashtags_dict['label'] = item.key
					hashtags_dict['value'] = item.key
					hashtags_array.push(hashtags_dict)
				}
			})
			filters.push({"catitems":"Hash Tags" ,"subitem": hashtags_array})
			this.setState({
				filters: filters
			})
		}
		
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = "/news/article/"+item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x276/left/top/"+decodeURIComponent(item.cover_image)
				searchresult_array.push(article_dict)
			}
		})
		if(extra_data){
			var results = [
				...this.state.searchResult,
				...searchresult_array
			]
		} else {
			var results = [
				...searchresult_array
			]
		}
		this.setState({
			searchResult: results,
			next: data.body.next,
			previous: data.body.previous,
			loadingPagination: false,
			isLoading: false
		})
	}

	queryFilter = (data, checked) => {
		if(checked == true){
			query_array.push(data);
		} else {
			query_array.splice(query_array.indexOf(data), 1);
		}
		final_query = query_array.join("&");
		this.setState({
			final_query: final_query,
			isLoading: true
		})

		if (history.pushState) {
			getRequest(ARTICLE_POSTS+"?"+this.state.domain+"&q="+QUERY+"&"+final_query, this.getSearchResult);
			var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname +"?q="+QUERY;
			if(final_query){
		    	newurl = newurl+"&"+final_query;
			}
		    window.history.pushState({},'',newurl);
		}
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
	}

	getBookmarksArticles = (data) => {
		var article_array = []
		var article_ids = data.body.results;
		for(var i = 0; i < article_ids.length; i++){
			if(this.state.bookmark_ids.indexOf(article_ids[i].article) === -1){
				article_array.push(article_ids[i].article)
				this.setState({
					bookmark_ids: article_array
				})
			}
		}
	}

	handleLogout = () => {
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
        getRequest(ARTICLE_LOGOUT, this.authLogoutResponse, headers);
    }

    authLogoutResponse = (data) => {
    	cookies.remove('token', { path: '/' })
    	cookies.remove('full_name', { path: '/' })
        this.setState({
			is_loggedin: false,
			is_captcha: true,
			bookmark_ids: []
		})
    }

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		if(this.state.final_query){
			getRequest(ARTICLE_POSTS+"?"+this.state.domain+"&q="+QUERY+"&"+this.state.final_query, this.getSearchResult);
		} else {
			getRequest(ARTICLE_POSTS+"?"+this.state.domain+"&q="+QUERY, this.getSearchResult);
		}
		if(cookies.get('full_name')){
			this.setState({is_loggedin:true})
			var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
			getRequest(ALL_ARTICLE_BOOKMARK+"?"+this.state.domain, this.getBookmarksArticles, headers);
		}
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, searchResult, filters, isFilterOpen, isSideOpen, isLoading, username, is_loggedin } = this.state;

		var result = searchResult.map((item, index) => {
			return(
				<div className="col-lg-4 mb-5">
					{isLoading ?
						<Skeleton height={525} />
					:
						<VerticleCardItem
							id={item.id}
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.slug}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
							is_loggedin={is_loggedin}
							toggle={this.toggle}
							is_open={modal}
							getArticleId={this.getArticleId}
							bookmark_ids={bookmark_ids}
							base_url={BASE_URL}
						/>
					}
				</div>
			)
		})

		if(isFilterOpen === true){
			document.getElementsByTagName("body")[0].style = "overflow:hidden !important";
		} else {
			document.getElementsByTagName("body")[0].style = "overflow:auto";
		}
		return(
			<React.Fragment>
				<Menu
					logo={logo}
					navitems={menus}
					url={URL}
					isSlider={true}
					isSideOpen={this.isSideOpen}
					toggle={this.toggle}
					is_loggedin={is_loggedin}
					username={username}
					handleLogout={this.handleLogout}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 mb-4">
											<div className="clerfix">
												<div className="float-right">
													<div className="filter" onClick={this.toggleFilter}>
														<FontAwesomeIcon icon={faFilter} /> Filter
													</div>
												</div>
												<div className="float-left">
													<div className="section-title">
														<h2 className="m-0 section-title">Search result: <span className="text-capitalize">{QUERY}</span></h2>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<div className="row">
										{
											this.state.loadingPagination ?
												<React.Fragment>
													<div className="lds-ring text-center"><div></div><div></div><div></div><div></div></div>
												</React.Fragment>
											: ""
										}
										{result}
									</div>
								</div>
							</div>
						</div>
						<Filter filters={filters} toggleFilter={this.toggleFilter} isFilterOpen={isFilterOpen} query={this.queryFilter} />
					</div>
				</div>

				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("search-result");
wrapper ? ReactDOM.render(<SearchResult />, wrapper) : null;