// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by lister-gen. DO NOT EDIT.

package v0alpha1

import (
	v0alpha1 "github.com/grafana/grafana/pkg/aggregator/apis/aggregation/v0alpha1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/tools/cache"
)

// DataPlaneServiceLister helps list DataPlaneServices.
// All objects returned here must be treated as read-only.
type DataPlaneServiceLister interface {
	// List lists all DataPlaneServices in the indexer.
	// Objects returned here must be treated as read-only.
	List(selector labels.Selector) (ret []*v0alpha1.DataPlaneService, err error)
	// Get retrieves the DataPlaneService from the index for a given name.
	// Objects returned here must be treated as read-only.
	Get(name string) (*v0alpha1.DataPlaneService, error)
	DataPlaneServiceListerExpansion
}

// dataPlaneServiceLister implements the DataPlaneServiceLister interface.
type dataPlaneServiceLister struct {
	indexer cache.Indexer
}

// NewDataPlaneServiceLister returns a new DataPlaneServiceLister.
func NewDataPlaneServiceLister(indexer cache.Indexer) DataPlaneServiceLister {
	return &dataPlaneServiceLister{indexer: indexer}
}

// List lists all DataPlaneServices in the indexer.
func (s *dataPlaneServiceLister) List(selector labels.Selector) (ret []*v0alpha1.DataPlaneService, err error) {
	err = cache.ListAll(s.indexer, selector, func(m interface{}) {
		ret = append(ret, m.(*v0alpha1.DataPlaneService))
	})
	return ret, err
}

// Get retrieves the DataPlaneService from the index for a given name.
func (s *dataPlaneServiceLister) Get(name string) (*v0alpha1.DataPlaneService, error) {
	obj, exists, err := s.indexer.GetByKey(name)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, errors.NewNotFound(v0alpha1.Resource("dataplaneservice"), name)
	}
	return obj.(*v0alpha1.DataPlaneService), nil
}
