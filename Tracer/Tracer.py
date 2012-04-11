'''
Created on 2012-4-9

@author: xmxjq
'''

import TraceNode
import hashlib

class Tracer(object):
    '''
        Tracer is the main part of the trace function.
        It has function to trace and save the whole route when a url is loaded by a browser.
        TODO: save the html and visualize the result
            mark the malicious node and nodes tree.
    '''
    def __init__(self):
        self.__traceNodesTable = {}
        self.__rootnode = None
        self.isinitialized = False
    
    def init_root(self, rooturl):
        self.__rootnode = TraceNode.TraceNode(rooturl, None)
        self.__traceNodesTable[hashlib.md5(rooturl).hexdigest()] = self.__rootnode
        self.isinitialized = True        
    
    def addNewUrl(self, url, parenturl):
        if self.__traceNodesTable.has_key(hashlib.md5(parenturl).hexdigest()):
            parentNode = self.__traceNodesTable[hashlib.md5(parenturl).hexdigest()]
            if not self.__traceNodesTable.has_key(hashlib.md5(url).hexdigest()):
                newNode = TraceNode.TraceNode(url, parentNode)
                parentNode.addChildNode(newNode)
                self.__traceNodesTable[hashlib.md5(url).hexdigest()] = newNode
                
    def printTraceRoute(self):
        for k,v in self.__traceNodesTable.iteritems():
            print k
            v.printNodeInfo()


tracer = Tracer()