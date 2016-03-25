QUnit.test("Initialize service", 3, assert => {
    const done = assert.async();

    const service = new Vidyano.Service("https://vidyano.azurewebsites.net");
    service.initialize().then(() => {
        assert.ok(service.isSignedIn);
        assert.ok(service.isUsingDefaultCredentials);
        assert.equal(service.userName, "demo");
        done();

        QUnit.test("Messages", assert => {
            assert.equal(service.getTranslatedMessage("SignIn"), "Sign in");
        });

        QUnit.test("Query", assert => {
            const done = assert.async();

            service.getQuery("Customers").then(qCustomers => {
                assert.ok(!qCustomers.notification, qCustomers.notification);

                const qriCustomer = qCustomers.items.filter(i => i.id === "19025")[0];
                assert.ok(!!qriCustomer);
                assert.equal(qriCustomer.id, "19025");

                done();

                QUnit.test("Persistent Object", assert => {
                    const done = assert.async();

                    qriCustomer.getPersistentObject().then(customerPo => {
                        assert.ok(!customerPo.notification, customerPo.notification);
                        assert.equal(customerPo.objectId, qriCustomer.id);

                        const firstName = "Catherine";
                        const firstNameReversed = firstName.split("").reverse().join("");

                        assert.strictEqual(customerPo.getAttributeValue("FirstName"), firstName);

                        assert.ok(!customerPo.isEditing);
                        customerPo.beginEdit();
                        assert.ok(customerPo.isEditing);

                        customerPo.attributes["FirstName"].setValue(firstNameReversed);
                        assert.strictEqual(customerPo.getAttributeValue("FirstName"), firstNameReversed);

                        const saveDone = assert.async();
                        customerPo.save().then(() => {
                            assert.strictEqual(customerPo.getAttributeValue("FirstName"), firstNameReversed);

                            assert.ok(!customerPo.isEditing);
                            customerPo.beginEdit();
                            assert.ok(customerPo.isEditing);

                            customerPo.attributes["FirstName"].setValue(firstName);
                            assert.strictEqual(customerPo.getAttributeValue("FirstName"), firstName);

                            customerPo.save().then(() => saveDone());
                        });

                        done();
                    }).catch(e => {
                        assert.equal(e, "");
                        done();
                    });
                });
            }).catch(e => {
                assert.equal(e, "");
                done();
            });
        });
    }).catch(e => {
        assert.equal(e, "");
        done();
    });
});