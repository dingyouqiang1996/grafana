package quotasets

import (
	"github.com/gophercloud/gophercloud"
)

// Get returns public data about a previously created QuotaSet.
func Get(client *gophercloud.ServiceClient, tenantID string) GetResult {
	var res GetResult
	_, res.Err = client.Get(getURL(client, tenantID), &res.Body, nil)
	return res
}

//Updates the quotas for the given tenantID and returns the new quota-set
func Update(client *gophercloud.ServiceClient, tenantID string, opts UpdateOptsBuilder) (res UpdateResult) {
	reqBody, err := opts.ToComputeQuotaUpdateMap()
	if err != nil {
		res.Err = err
		return
	}

	_, res.Err = client.Put(updateURL(client, tenantID), reqBody, &res.Body, &gophercloud.RequestOpts{OkCodes: []int{200}})
	return res
}

//Resets the uotas for the given tenant to their default values
func Delete(client *gophercloud.ServiceClient, tenantID string) (res DeleteResult) {
	_, res.Err = client.Delete(deleteURL(client, tenantID), nil)
	return
}

//Options for Updating the quotas of a Tenant
//All int-values are pointers so they can be nil if they are not needed
//you can use gopercloud.IntToPointer() for convenience
type UpdateOpts struct {
	//FixedIps is number of fixed ips alloted this quota_set
	FixedIps *int `json:"fixed_ips,omitempty"`
	// FloatingIps is number of floating ips alloted this quota_set
	FloatingIps *int `json:"floating_ips,omitempty"`
	// InjectedFileContentBytes is content bytes allowed for each injected file
	InjectedFileContentBytes *int `json:"injected_file_content_bytes,omitempty"`
	// InjectedFilePathBytes is allowed bytes for each injected file path
	InjectedFilePathBytes *int `json:"injected_file_path_bytes,omitempty"`
	// InjectedFiles is injected files allowed for each project
	InjectedFiles *int `json:"injected_files,omitempty"`
	// KeyPairs is number of ssh keypairs
	KeyPairs *int `json:"key_pairs,omitempty"`
	// MetadataItems is number of metadata items allowed for each instance
	MetadataItems *int `json:"metadata_items,omitempty"`
	// Ram is megabytes allowed for each instance
	Ram *int `json:"ram,omitempty"`
	// SecurityGroupRules is rules allowed for each security group
	SecurityGroupRules *int `json:"security_group_rules,omitempty"`
	// SecurityGroups security groups allowed for each project
	SecurityGroups *int `json:"security_groups,omitempty"`
	// Cores is number of instance cores allowed for each project
	Cores *int `json:"cores,omitempty"`
	// Instances is number of instances allowed for each project
	Instances *int `json:"instances,omitempty"`
	// Number of ServerGroups allowed for the project
	ServerGroups *int `json:"server_groups,omitempty"`
	// Max number of Members for each ServerGroup
	ServerGroupMembers *int `json:"server_group_members,omitempty"`
	//Users can force the update even if the quota has already been used and the reserved quota exceeds the new quota.
	Force bool `json:"force,omitempty"`
}

type UpdateOptsBuilder interface {
	//Extra specific name to prevent collisions with interfaces for other quotas (e.g. neutron)
	ToComputeQuotaUpdateMap() (map[string]interface{}, error)
}

func (opts UpdateOpts) ToComputeQuotaUpdateMap() (map[string]interface{}, error) {

	return gophercloud.BuildRequestBody(opts, "quota_set")
}
