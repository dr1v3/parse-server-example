var funcs = require('./funcs.js');
var TransportationRequestHelper = require('./TransportationRequestHelper.js');
var TransportationRequestHelper2 = require('./TransportationRequestHelper_v2.js');
var RelationsHelper = require('./ProvidersEnterpriseRelationsHelper.js');
var VehicleDriverHelper = require("./vehicleDriverHelper.js");
var MandrillHelper = require("./mandrillHelper.js");
var JobsHelper = require("./jobsHelper.js")
var JobsController = require("./JobsController.js");


Parse.Cloud.define("chargeAmountTransportationProvider", JobsController.getChargeAmountTransportationProvider);
Parse.Cloud.define("chargeAmountTaxi", JobsController.getChargeAmountTaxi);
Parse.Cloud.define("acceptJob", JobsController.acceptJob);
Parse.Cloud.define("setPickedUpJob", JobsController.setPickedUp);
Parse.Cloud.define("cancelJob", JobsController.cancelJob);
Parse.Cloud.define("completeRequest", JobsController.completeTransportationRequest);

// Parse.Cloud.define("cancelJob", JobsHelper.cancelJob);
// Parse.Cloud.define("acceptJob", JobsHelper.acceptJob);
// Parse.Cloud.define("setPickedUpJob", JobsHelper.setPickedUp);
// Parse.Cloud.define("completeRequest", TransportationRequestHelper2.completeTransportationRequest);

Parse.Cloud.define("forwardRequest", TransportationRequestHelper2.forwardTransportationRequest);


Parse.Cloud.define("createEPlansOnStripe", funcs.createAllEnterprisePlansOnStripe);
Parse.Cloud.define("createStripeCustomer", funcs.createStripeCustomer);
Parse.Cloud.define("addInsuranceCompanies", funcs.addInsuranceCompanies);
Parse.Cloud.define("copyInsuranceCompanies", funcs.copyInsuranceCompanies);

Parse.Cloud.define("purchaseEnterpriseRelationPlan", funcs.purchaseEnterpriseRelation);
Parse.Cloud.define("updateEnterpriseRelationPlan", funcs.updateEnterpriseRelationPlan);
Parse.Cloud.define("deleteEnterpriseRelationPlan", funcs.removeEnterpriseRelation);

Parse.Cloud.define("sendInviteEnterpriseRelation", RelationsHelper.invite);
Parse.Cloud.define("cancelEnterpriaeRelation", RelationsHelper.cancel);
Parse.Cloud.define("cancelEnterpriseRelation", RelationsHelper.cancel);
Parse.Cloud.define("acceptEnterpriseRelation", RelationsHelper.accept);

Parse.Cloud.define("confirmDriverActivation", VehicleDriverHelper.confirmDriverActivation);
Parse.Cloud.define("deactivateVehicleAndDriver", VehicleDriverHelper.deactivateVehicleNDriver);
Parse.Cloud.define("activateDriverAndVehicle", VehicleDriverHelper.activateDriverNVehicle);
Parse.Cloud.define("activateDispatcher", VehicleDriverHelper.activateDispatcher);
Parse.Cloud.define("deactivateDispatcher", VehicleDriverHelper.deactivateDispatcher);

Parse.Cloud.define("activateDispatcherWithId", VehicleDriverHelper.activateDispatcherWithId);
Parse.Cloud.define("confirmDispatcherActivation", VehicleDriverHelper.confirmDispatcherActivation);


Parse.Cloud.beforeSave("EnterpriseRelation", function(request, response){
	var relation = request.object;

	var vehiclesAmount = 0;
	if(relation.get("vehicles")) {
		vehiclesAmount = relation.get("vehicles").length;
	}

	var plan = relation.get("enterprisePlan");
	var stripeSubscriptionId = relation.get("stripeSubscriptionId");

	if(!plan) {
		response.error("Enterprise plan not selected");
		return;
	}

	// if(!stripeSubscriptionId) {
	// 	response.error("Subscription is not active");
	// 	return;	
	// }

	plan.fetch().then(
		function (object) {
			var limit = object.get("vehicleLimit");
			if(limit != 0 && vehiclesAmount > limit) {
				response.error("Vehicles amount should not exceed the plan limit!");
			} else {
				response.success();
			}
		},

		function (error) {
			response.error(error);
		}
	);

});

Parse.Cloud.beforeSave("TransportationProvider", function (request, response){
	var tprovider = request.object;
	var plan = tprovider.get("enterprisePlan");

	if(!plan){
		response.success();
		return;
	}

	plan.fetch().then(
		function (object){
			plan = object;

			var limits = plan.get("vehicleLimit");
			if(limits == 0){
				response.success();
				return;
			}

			var vehiclesAmount = tprovider.get("vehicles").length;

			if(limits >= vehiclesAmount){
				response.success();
				return;
			}

			response.error("Your current business plan requires not exceeding " + limits + " vehicles to be declared!");
		},

		function (error){
			response.error(error);
		}
	);

});

Parse.Cloud.afterSave("TransportationProvider", function (request, response) {
    if (!request.object.existed()) {
        MandrillHelper.sendMail(request.object);
    }
});

Parse.Cloud.afterSave("HealthcareProvider", function (request, response) {
    if (!request.object.existed()) {
        MandrillHelper.sendMail(request.object);
    }
});

Parse.Cloud.afterSave("Consumer", function (request, response) {
    if (!request.object.existed()) {
        MandrillHelper.sendMail(request.object);
    }
});

Parse.Cloud.beforeSave("Job", function (request, response) {
    if (request.object.existed()) {
        response.success();
        return;
    }

    JobsController.beforeJobSave(request.object, response);
});


Parse.Cloud.afterSave("Job", function (request) {
    if (request.object.existed()) {
        return;
    }

    JobsController.afterJobSave(request.object);

});