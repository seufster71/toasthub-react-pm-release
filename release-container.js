/*
 * Copyright (C) 2020 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use-strict';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as releaseActions from './release-actions';
import fuLogger from '../../core/common/fu-logger';
import ReleaseView from '../../memberView/pm_release/release-view';
import ReleaseModifyView from '../../memberView/pm_release/release-modify-view';
import utils from '../../core/common/utils';
import moment from 'moment';


class PMReleaseContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {pageName:"PM_RELEASE",isDeleteModalOpen: false, errors:null, warns:null, successes:null};
		this.onListLimitChange = this.onListLimitChange.bind(this);
		this.onSearchClick = this.onSearchClick.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this);
		this.onPaginationClick = this.onPaginationClick.bind(this);
		this.onOrderBy = this.onOrderBy.bind(this);
		this.openDeleteModal = this.openDeleteModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onModify = this.onModify.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onEditRoles = this.onEditRoles.bind(this);
		this.inputChange = this.inputChange.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.clearVerifyPassword = this.clearVerifyPassword.bind(this);
	}

	componentDidMount() {
		this.props.actions.init();
	}

	onListLimitChange(fieldName) {
		return (event) => {
			let value = 20;
			if (this.props.codeType === 'NATIVE') {
				value = event.nativeEvent.text;
			} else {
				value = event.target.value;
			}

			let listLimit = parseInt(value);
			this.props.actions.listLimit({state:this.props.pmrelease,listLimit});
		};
	}

	onPaginationClick(value) {
		return(event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onPaginationClick',msg:"fieldName "+ value});
			let listStart = this.props.pmrelease.listStart;
			let segmentValue = 1;
			let oldValue = 1;
			if (this.state["PM_RELEASE_PAGINATION"] != null && this.state["PM_RELEASE_PAGINATION"] != ""){
				oldValue = this.state["PM_RELEASE_PAGINATION"];
			}
			if (value === "prev") {
				segmentValue = oldValue - 1;
			} else if (value === "next") {
				segmentValue = oldValue + 1;
			} else {
				segmentValue = value;
			}
			listStart = ((segmentValue - 1) * this.props.pmrelease.listLimit);
			this.setState({"PM_RELEASE_PAGINATION":segmentValue});
			
			this.props.actions.list({state:this.props.pmrelease,listStart});
		};
	}

	onSearchChange(fieldName) {
		return (event) => {
			if (event.type === 'keypress' && event.key === 'Enter') {
				this.searchClick(fieldName,event);
			} else {
				if (this.props.codeType === 'NATIVE') {
					this.setState({[fieldName]:event.nativeEvent.text});
				} else {
					this.setState({[fieldName]:event.target.value});
				}
			}
		};
	}

	onSearchClick(fieldName) {
		return (event) => {
			this.searchClick(fieldName,event);
		};
	}
	
	searchClick(fieldName,event) {
		let searchCriteria = [];
		if (fieldName === 'PM_RELEASE-SEARCHBY') {
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					option.searchValue = this.state['PM_RELEASE-SEARCH'];
					option.searchColumn = event[o].value;
					searchCriteria.push(option);
				}
			}
		} else {
			for (let i = 0; i < this.props.pmrelease.searchCriteria.length; i++) {
				let option = {};
				option.searchValue = this.state['PM_RELEASE-SEARCH'];
				option.searchColumn = this.props.pmrelease.searchCriteria[i].searchColumn;
				searchCriteria.push(option);
			}
		}

		this.props.actions.search({state:this.props.pmrelease,searchCriteria});
	}

	onOrderBy(selectedOption) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onOrderBy',msg:"id " + selectedOption});
			let orderCriteria = [];
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					if (event[o].label.includes("ASC")) {
						option.orderColumn = event[o].value;
						option.orderDir = "ASC";
					} else if (event[o].label.includes("DESC")){
						option.orderColumn = event[o].value;
						option.orderDir = "DESC";
					} else {
						option.orderColumn = event[o].value;
					}
					orderCriteria.push(option);
				}
			} else {
				let option = {orderColumn:"PM_RELEASE_TABLE_NAME",orderDir:"ASC"};
				orderCriteria.push(option);
			}
			this.props.actions.orderBy({state:this.props.pmrelease,orderCriteria});
		};
	}
	
	onSave() {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onSave',msg:"test"});
			let errors = utils.validateFormFields(this.props.pmrelease.prefForms.PM_RELEASE_FORM,this.props.pmrelease.inputFields);
			
			if (errors.isValid){
				this.props.actions.saveItem({state:this.props.pmrelease});
			} else {
				this.setState({errors:errors.errorMap});
			}
		};
	}
	
	onModify(item) {
		return (event) => {
			let id = null;
			if (item != null && item.id != null) {
				id = item.id;
			}
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onModify',msg:"test"+id});
			this.props.actions.modifyItem({id,appPrefs:this.props.appPrefs});
		};
	}
	
	onDelete(item) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onDelete',msg:"test"});
			this.setState({isDeleteModalOpen:false});
			if (item != null && item.id != "") {
				this.props.actions.deleteItem({state:this.props.pmrelease,id:item.id});
			}
		};
	}
	
	openDeleteModal(item) {
		return (event) => {
		    this.setState({isDeleteModalOpen:true,selected:item});
		}
	}
	
	onEditRoles(item) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onEditRoles',msg:"test"+item.id});
			this.props.history.push({pathname:'/admin-roles',state:{parent:item}});
		};
	}
	
	closeModal() {
		return (event) => {
			this.setState({isDeleteModalOpen:false,errors:null,warns:null});
		};
	}
	
	onCancel() {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onCancel',msg:"test"});
			this.props.actions.list({state:this.props.pmrelease});
		};
	}
	
	inputChange(fieldName,switchValue) {
		return (event) => {
			let value = "";
			if (switchValue === "DATE") {
				value = event.toISOString();
			} else {
				value = switchValue;
			}
			utils.inputChange(this.props,fieldName,value);
		};
	}
	
	onBlur(field) {
		return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::onBlur',msg:field.name});
			let fieldName = field.name;
			// get field and check what to do
			if (field.optionalParams != ""){
				let optionalParams = JSON.parse(field.optionalParams);
				if (optionalParams.onBlur != null) {
					if (optionalParams.onBlur.validation != null && optionalParams.onBlur.validation == "matchField") {
						if (field.validation != "") {
							let validation = JSON.parse(field.validation);
							if (validation[optionalParams.onBlur.validation] != null && validation[optionalParams.onBlur.validation].id != null){
								if (this.props.pmrelease.inputFields[validation[optionalParams.onBlur.validation].id] == this.props.pmrelease.inputFields[fieldName]) {
									if (validation[optionalParams.onBlur.validation].successMsg != null) {
										let successMap = this.state.successes;
										if (successMap == null){
											successMap = {};
										}
										successMap[fieldName] = validation[optionalParams.onBlur.validation].successMsg;
										this.setState({successes:successMap, errors:null});
									}
								} else {
									if (validation[optionalParams.onBlur.validation].failMsg != null) {
										let errorMap = this.state.errors;
										if (errorMap == null){
											errorMap = {};
										}
										errorMap[fieldName] = validation[optionalParams.onBlur.validation].failMsg;
										this.setState({errors:errorMap, successes:null});
									}
								}
							}
						}
					} else if (optionalParams.onBlur.func != null) {
						if (optionalParams.onBlur.func == "clearVerifyPassword"){
							this.clearVerifyPassword();
						}
					}
				}
			}
			
		};
	}
	
	clearVerifyPassword() {
	//	return (event) => {
			fuLogger.log({level:'TRACE',loc:'ReleaseContainer::clearVerifyPassword',msg:"Hi there"});
			this.setState({errors:null, successes:null});
			this.props.actions.clearField('PM_RELEASE_FORM_VERIFY_PASSWORD');
	//	}
	}

	render() {
		fuLogger.log({level:'TRACE',loc:'ReleaseContainer::render',msg:"Hi there"});
		if (this.props.pmrelease.isModifyOpen) {
			return (
				<ReleaseModifyView
				containerState={this.state}
				item={this.props.pmrelease.selected}
				inputFields={this.props.pmrelease.inputFields}
				appPrefs={this.props.appPrefs}
				itemPrefForms={this.props.pmrelease.prefForms}
				onSave={this.onSave}
				onCancel={this.onCancel}
				onReturn={this.onCancel}
				inputChange={this.inputChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmrelease.items != null) {
			return (
				<ReleaseView
				containerState={this.state}
				itemState={this.props.pmrelease}
				appPrefs={this.props.appPrefs}
				onListLimitChange={this.onListLimitChange}
				onSearchChange={this.onSearchChange}
				onSearchClick={this.onSearchClick}
				onPaginationClick={this.onPaginationClick}
				onOrderBy={this.onOrderBy}
				openDeleteModal={this.openDeleteModal}
				closeModal={this.closeModal}
				onModify={this.onModify}
				onDelete={this.onDelete}
				onEditRoles={this.onEditRoles}
				inputChange={this.inputChange}
				session={this.props.session}
				/>
			);
		} else {
			return (<div> Loading... </div>);
		}
	}
}

PMReleaseContainer.propTypes = {
	appPrefs: PropTypes.object,
	actions: PropTypes.object,
	pmrelease: PropTypes.object,
	session: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {appPrefs:state.appPrefs, pmrelease:state.pmrelease, session:state.session};
}

function mapDispatchToProps(dispatch) {
  return { actions:bindActionCreators(releaseActions,dispatch) };
}

export default connect(mapStateToProps,mapDispatchToProps)(PMReleaseContainer);
